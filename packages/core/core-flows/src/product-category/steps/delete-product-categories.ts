import { IProductModuleService } from "@medusajs/types"
import { Modules } from "@medusajs/utils"
import { StepResponse, createStep } from "@medusajs/workflows-sdk"

export const deleteProductCategoriesStepId = "delete-product-categories"
/**
 * This step deletes one or more product categories.
 */
export const deleteProductCategoriesStep = createStep(
  deleteProductCategoriesStepId,
  async (ids: string[], { container }) => {
    const service = container.resolve<IProductModuleService>(Modules.PRODUCT)

    await service.softDeleteProductCategories(ids)
    return new StepResponse(void 0, ids)
  },
  async (prevIds, { container }) => {
    if (!prevIds?.length) {
      return
    }

    const service = container.resolve<IProductModuleService>(Modules.PRODUCT)

    await service.restoreProductCategories(prevIds)
  }
)
