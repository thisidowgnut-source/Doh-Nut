/** 
 * Shared exact-money API for DOHNUT
 * Provides consistent money handling across the application to prevent floating-point errors
 */

import { Prisma } from "@prisma/client";

/**
 * Converts a number to a Prisma.Decimal with exactly 2 decimal places
 * This ensures consistent precision for money values stored in the database
 */
export function toDecimal(amount: number | string): Prisma.Decimal {
  return new Prisma.Decimal(amount);
}

/**
 * Safely adds two monetary values with exact precision
 */
export function addMoney(a: number | string | Prisma.Decimal, b: number | string | Prisma.Decimal): Prisma.Decimal {
  return new Prisma.Decimal(a).plus(new Prisma.Decimal(b));
}

/**
 * Safely subtracts two monetary values with exact precision
 */
export function subtractMoney(a: number | string | Prisma.Decimal, b: number | string | Prisma.Decimal): Prisma.Decimal {
  return new Prisma.Decimal(a).minus(new Prisma.Decimal(b));
}

/**
 * Safely multiplies a monetary value by a multiplier (e.g., for tax calculations)
 * Returns result with exactly 2 decimal places
 */
export function multiplyMoney(amount: number | string | Prisma.Decimal, multiplier: number | string): Prisma.Decimal {
  return new Prisma.Decimal(amount).times(new Prisma.Decimal(multiplier)).toDecimalPlaces(2);
}

/**
 * Safely divides a monetary value by a divisor
 * Returns result with exactly 2 decimal places
 */
export function divideMoney(amount: number | string | Prisma.Decimal, divisor: number | string): Prisma.Decimal {
  return new Prisma.Decimal(amount).div(new Prisma.Decimal(divisor)).toDecimalPlaces(2);
}

/**
 * Rounds a monetary value to exactly 2 decimal places
 */
export function roundMoney(amount: number | string | Prisma.Decimal): Prisma.Decimal {
  return new Prisma.Decimal(amount).toDecimalPlaces(2);
}

/**
 * Converts a Prisma.Decimal to a number for JSON serialization
 * Note: This may lose precision for very large numbers, but is safe for typical money values
 */
export function toNumber(decimal: Prisma.Decimal): number {
  return decimal.toNumber();
}

/**
 * Formats a monetary value as Malaysian Ringgit with exactly 2 decimal places
 */
export function formatMYRExact(amount: number | string | Prisma.Decimal): string {
  return `RM${new Prisma.Decimal(amount).toDecimalPlaces(2).toFixed(2)}`;
}

/**
 * Converts Ringgit to sen (integer) for Billplz API
 * RM1.23 → 123 sen
 */
export function toSen(amount: number | string | Prisma.Decimal): number {
  return new Prisma.Decimal(amount).times(100).toDecimalPlaces(0).toNumber();
}

/**
 * Converts sen (integer) back to Ringgit
 * 123 sen → RM1.23
 */
export function toRinggit(sen: number | string): Prisma.Decimal {
  return new Prisma.Decimal(sen).div(100).toDecimalPlaces(2);
}