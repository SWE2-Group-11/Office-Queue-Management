import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAllServices } from "../controllers/services-controller";
import { listServices } from "../dao/service-dao";

/*
UNIT tests for getAllServices (GET /services).
The DAO module is mocked: no database involved.
*/

vi.mock("../dao/service-dao", () => ({ listServices: vi.fn() }));

describe("getAllServices (unit)", () => {
    const entities = [
        { id: 1, tag_name: "deposit", service_time: 5 },
        { id: 2, tag_name: "shipping", service_time: 8 },
        { id: 3, tag_name: "account_management", service_time: 12 },
    ];

    beforeEach(() => {
        vi.resetAllMocks();
        vi.mocked(listServices).mockReturnValue(entities);
    });

    it("returns every service as { id, tag_name }", () => {
        expect(getAllServices()).toEqual([
            { id: 1, tag_name: "deposit" },
            { id: 2, tag_name: "shipping" },
            { id: 3, tag_name: "account_management" },
        ]);
    });

    it("does not leak internal fields such as service_time to the client", () => {
        for (const dto of getAllServices()) {
            expect(dto).not.toHaveProperty("service_time");
        }
    });

    it("keeps the order given by the DAO", () => {
        vi.mocked(listServices).mockReturnValue([...entities].reverse());

        expect(getAllServices().map((s) => s.id)).toEqual([3, 2, 1]);
    });

    it("returns an empty list when there are no services", () => {
        vi.mocked(listServices).mockReturnValue([]);

        expect(getAllServices()).toEqual([]);
    });

    it("asks the DAO exactly once", () => {
        getAllServices();

        expect(listServices).toHaveBeenCalledTimes(1);
    });

    it("lets a database failure through instead of swallowing it", () => {
        const boom = new Error("database is locked");
        vi.mocked(listServices).mockImplementation(() => {
            throw boom;
        });

        expect(() => getAllServices()).toThrow(boom);
    });
});
