import { ICustomerModuleService } from "@medusajs/types"
import { Modules } from "@medusajs/utils"
import { medusaIntegrationTestRunner } from "medusa-test-utils"
import {
  generatePublishableKey,
  generateStoreHeaders,
} from "../../../../helpers/create-admin-user"
import { createAuthenticatedCustomer } from "../../../helpers/create-authenticated-customer"

const env = { MEDUSA_FF_MEDUSA_V2: true }

jest.setTimeout(100000)

medusaIntegrationTestRunner({
  env,
  testSuite: ({ dbConnection, getContainer, api }) => {
    describe("GET /store/customers/me/addresses", () => {
      let appContainer
      let customerModuleService: ICustomerModuleService
      let storeHeaders

      beforeAll(async () => {
        appContainer = getContainer()
        customerModuleService = appContainer.resolve(Modules.CUSTOMER)
      })

      beforeEach(async () => {
        appContainer = getContainer()
        const publishableKey = await generatePublishableKey(appContainer)
        storeHeaders = generateStoreHeaders({ publishableKey })
      })

      it("should get all customer addresses and its count", async () => {
        const { customer, jwt } = await createAuthenticatedCustomer(
          appContainer
        )

        await customerModuleService.createCustomerAddresses([
          {
            first_name: "Test",
            last_name: "Test",
            address_1: "Test street 1",
            customer_id: customer.id,
          },
          {
            first_name: "Test",
            last_name: "Test",
            address_1: "Test street 2",
            customer_id: customer.id,
          },
          {
            first_name: "Test",
            last_name: "Test",
            address_1: "Test street 3",
            customer_id: customer.id,
          },
        ])

        await customerModuleService.createCustomers({
          first_name: "Test Test",
          last_name: "Test Test",
          addresses: [
            {
              first_name: "Test TEST",
              last_name: "Test TEST",
              address_1: "NOT street 1",
            },
          ],
        })

        const response = await api.get(`/store/customers/me/addresses`, {
          headers: { authorization: `Bearer ${jwt}`, ...storeHeaders.headers },
        })

        expect(response.status).toEqual(200)
        expect(response.data.count).toEqual(3)
        expect(response.data.addresses).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              customer_id: customer.id,
              address_1: "Test street 1",
            }),
            expect.objectContaining({
              id: expect.any(String),
              customer_id: customer.id,
              address_1: "Test street 2",
            }),
            expect.objectContaining({
              id: expect.any(String),
              customer_id: customer.id,
              address_1: "Test street 3",
            }),
          ])
        )
      })
    })
  },
})
