#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/38e040914e0ac420e68f2245a0ee73abe0831d8ce580932c65814bd552b2a4cd/contract';
import endContract from '../../snapshots/38e040914e0ac420e68f2245a0ee73abe0831d8ce580932c65814bd552b2a4cd/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'Member',
        columns: [
          col('cardNumber', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('fullName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', {
            notNull: true,
            default: fn('gen_random_uuid()'),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Reservation',
        columns: [
          col('bookId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('bookTitle', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', {
            notNull: true,
            default: fn('gen_random_uuid()'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('memberId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('CONFIRMED'),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Member',
        constraint: 'Member_cardNumber_key',
        columns: ['cardNumber'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Member',
        constraint: 'Member_email_key',
        columns: ['email'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Reservation',
        index: 'Reservation_memberId_idx_76b3c263',
        columns: ['memberId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Reservation',
        foreignKey: {
          name: 'Reservation_memberId_fkey',
          columns: ['memberId'],
          references: { schema: 'public', table: 'Member', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
