import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { toLocalDate } from "../services/date-service";

/*
UNIT tests for toLocalDate, the "today" of a ticket (Story 1 - Get ticket).
A ticket's day must be the LOCAL date (docs/database.md), the same one the seed
uses with date('now', 'localtime'). The time zone is set per test through
process.env.TZ, so the result does not depend on the machine running the tests.
*/

const ORIGINAL_TZ = process.env.TZ;

describe("toLocalDate (unit)", () => {
    beforeEach(() => {
        process.env.TZ = "Europe/Rome";
    });

    afterEach(() => {
        vi.useRealTimers();
        if (ORIGINAL_TZ === undefined) {
            delete process.env.TZ;
        } else {
            process.env.TZ = ORIGINAL_TZ;
        }
    });

    it("formats a date as YYYY-MM-DD", () => {
        expect(toLocalDate(new Date("2026-10-09T10:00:00Z"))).toBe("2026-10-09");
    });

    it("pads month and day with a leading zero", () => {
        expect(toLocalDate(new Date("2026-01-05T10:00:00Z"))).toBe("2026-01-05");
    });

    it("uses the local day, not the UTC day, just after local midnight", () => {
        // 23:30 UTC on 9 October is 01:30 on 10 October in Rome
        expect(toLocalDate(new Date("2026-10-09T23:30:00Z"))).toBe("2026-10-10");
    });

    it("uses the local day, not the UTC day, west of UTC", () => {
        process.env.TZ = "America/New_York";

        // 02:00 UTC on 10 October is 22:00 on 9 October in New York
        expect(toLocalDate(new Date("2026-10-10T02:00:00Z"))).toBe("2026-10-09");
    });

    it("turns over the year at local midnight", () => {
        // 23:30 UTC on 31 December is 00:30 on 1 January in Rome
        expect(toLocalDate(new Date("2026-12-31T23:30:00Z"))).toBe("2027-01-01");
    });

    it("uses the current time when no date is given", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-10-09T23:30:00Z"));

        expect(toLocalDate()).toBe("2026-10-10");
    });
});
