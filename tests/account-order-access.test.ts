import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { orderAccessFilter } from "../lib/account/order-access";

describe("orderAccessFilter", () => {
  it("requires both order id and user id so user B cannot load user A order by id alone", () => {
    const userA = "user-a-uuid";
    const userB = "user-b-uuid";
    const orderId = "order-uuid";

    assert.deepEqual(orderAccessFilter(userA, orderId), {
      id: orderId,
      userId: userA,
    });

    assert.notDeepEqual(orderAccessFilter(userB, orderId), {
      id: orderId,
      userId: userA,
    });
  });
});
