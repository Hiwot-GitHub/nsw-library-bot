import { z } from "zod";
import { tool } from "ai";
import { db } from "@/lib/prisma";

export type MemberIdentifier = string;
export type BookTitleQuery = string;

export const memberIdentifierSchema = z.string().describe("The member's email address or library card number");
export const bookTitleSchema = z.string().describe("The exact title or search query of the book");

// ==========================================
// TOOL 1: Validate Member against local database
// ==========================================
export const validateMember = tool({
  description: "Verify if a user is a registered NSW library member using their email address or library card number.",
  inputSchema: z.object({
    identifier: memberIdentifierSchema,
  }),
  execute: async ({ identifier }) => {
    try {
      const isEmail = identifier.includes("@");
      const allMembers = await db.orm.public.Member.all();

      const matchedMember = allMembers.find((m: any) => 
        isEmail ? m.email === identifier : m.cardNumber === identifier
      );

      if (!matchedMember) {
        return { 
          valid: false, 
          message: `No active NSW library membership found for "${identifier}". Please check your details or register with your local branch.` 
        };
      }

      return {
        valid: true,
        memberName: matchedMember.fullName,
        memberId: matchedMember.id,
        message: `Membership verified for ${matchedMember.fullName}. You may proceed with your request.`
      };
    } catch (error) {
      console.error("Member validation error:", error);
      return { valid: false, message: "Database error occurred while validating membership." };
    }
  },
});

// ==========================================
// TOOL 2: Search Open Library API
// ==========================================
export const checkAvailability = tool({
  description: "Search the global Open Library catalogue to find books, check details, and retrieve unique keys and cover image IDs.",
  inputSchema: z.object({
    query: bookTitleSchema,
  }),
  execute: async ({ query }) => {
    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(`https://openlibrary.org/search.json?q=${encodedQuery}&limit=5`);
      
      if (!response.ok) {
        return { available: false, message: "Failed to connect to the Open Library catalogue." };
      }

      const data = await response.json();
      const docs = data.docs || [];

      if (docs.length === 0) {
        return {
          available: false,
          message: `We couldn't find any matches for "${query}" in the Open Library catalogue.`
        };
      }

      // Map results and capture cover_i for displaying thumbnails in the UI
      const matches = docs.map((doc: any) => ({
        openLibraryId: doc.key, // e.g., "/works/OL45804W"
        title: doc.title,
        author: doc.author_name ? doc.author_name.join(", ") : "Unknown Author",
        firstPublishYear: doc.first_publish_year || "N/A",
        coverId: doc.cover_i || null, // Open Library cover image ID
        coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null,
        status: "Available for Reservation"
      }));

      return {
        available: true,
        books: matches,
        message: `Found ${matches.length} matching book(s) in the Open Library catalogue.`
      };
    } catch (error) {
      console.error("Open Library API error:", error);
      return { available: false, message: "An error occurred while searching the catalogue." };
    }
  },
});

// ==========================================
// TOOL 3: Reserve Book & Save to Database
// ==========================================
export const reserveBook = tool({
  description: "Place a hold/reservation for a verified member on a book using its Open Library key, title, and optional cover ID.",
  inputSchema: z.object({
    identifier: memberIdentifierSchema,
    bookTitle: z.string().describe("The exact title of the book being reserved"),
    openLibraryId: z.string().describe("The specific unique work key (e.g. /works/OL...) retrieved from the catalogue search"),
    coverId: z.number().optional().describe("The optional Open Library cover ID if available"),
  }),
  execute: async ({ identifier, bookTitle, openLibraryId, coverId }) => {
    try {
      // 1. Double check member verification
      const isEmail = identifier.includes("@");
      const allMembers = await db.orm.public.Member.all();
      
      const reservingMember = allMembers.find((m: any) => 
        isEmail ? m.email === identifier : m.cardNumber === identifier
      );

      if (!reservingMember) {
        return { success: false, message: "Member verification failed. Please validate your membership before reserving." };
      }

      // 2. Save reservation to your PostgreSQL database
      const reservation = await db.orm.public.Reservation.create({
        memberId: reservingMember.id,
        bookTitle,
        openLibraryId,
        coverId: coverId || null,
        status: "CONFIRMED",
      });

      return {
        success: true,
        message: `Reservation confirmed! "${bookTitle}" has been successfully placed on hold for ${reservingMember.fullName}. Reference ID: #${reservation?.id || 'NEW'}.`,
        coverUrl: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null
      };
    } catch (error) {
      console.error("Reservation execution error:", error);
      return { success: false, message: "Failed to record reservation in the database." };
    }
  },
});