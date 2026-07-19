import { isThemeConfig, migrateThemeConfig, type ThemeConfig } from "./theme"

export type SavedVariant = {
  id: string
  name: string
  config: ThemeConfig
  updatedAt: string
}

export const MAX_SAVED_VARIANTS = 3
export const MAX_VARIANT_NAME_LENGTH = 60
export const VARIANTS_STORAGE_KEY = "ui-component-gallery.variants.v1"
const VARIANTS_VERSION = 1 as const

type VariantsStore = {
  version: typeof VARIANTS_VERSION
  variants: SavedVariant[]
}

type ReadStorage = Pick<Storage, "getItem">
type WriteStorage = Pick<Storage, "setItem">

const cloneConfig = (config: ThemeConfig): ThemeConfig => structuredClone(config)
const cloneVariant = (variant: SavedVariant): SavedVariant => ({ ...variant, config: cloneConfig(variant.config) })

export function isVariantNameValid(name: unknown): name is string {
  return typeof name === "string" && name.trim().length > 0 && name.trim().length <= MAX_VARIANT_NAME_LENGTH
}

function validatedName(name: string): string {
  const clean = name.trim()
  if (!isVariantNameValid(clean)) {
    throw new TypeError(`Layout names must be between 1 and ${MAX_VARIANT_NAME_LENGTH} characters`)
  }
  return clean
}

function isSavedVariant(value: unknown): value is SavedVariant {
  if (!value || typeof value !== "object") return false
  const variant = value as Partial<SavedVariant>
  return typeof variant.id === "string" && variant.id.length > 0 &&
    isVariantNameValid(variant.name) && variant.name === variant.name.trim() &&
    typeof variant.updatedAt === "string" && Number.isFinite(Date.parse(variant.updatedAt)) &&
    isThemeConfig(variant.config)
}

function nextName(variants: readonly SavedVariant[], preferred?: string): string {
  if (preferred !== undefined) return validatedName(preferred)
  const names = new Set(variants.map(({ name }) => name))
  let number = 1
  while (names.has(`Layout ${number}`)) number += 1
  return `Layout ${number}`
}

function localId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID()
  return `variant-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function assertCapacity(variants: readonly SavedVariant[]): void {
  if (variants.length >= MAX_SAVED_VARIANTS) {
    throw new RangeError(`Only ${MAX_SAVED_VARIANTS} saved layouts are supported`)
  }
}

export function loadVariants(
  storage: ReadStorage | null = typeof localStorage === "undefined" ? null : localStorage,
): SavedVariant[] {
  if (!storage) return []
  try {
    const raw = storage.getItem(VARIANTS_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object") return []
    const store = parsed as Partial<VariantsStore>
    if (store.version !== VARIANTS_VERSION || !Array.isArray(store.variants) || store.variants.length > MAX_SAVED_VARIANTS) return []
    const migrated = store.variants.map((variant) => {
      if (!variant || typeof variant !== "object") return null
      const config = migrateThemeConfig((variant as SavedVariant).config)
      return config ? { ...(variant as SavedVariant), config } : null
    })
    if (migrated.some((variant) => !variant || !isSavedVariant(variant))) return []
    const variants = migrated as SavedVariant[]
    const ids = new Set(variants.map(({ id }) => id))
    if (ids.size !== variants.length) return []
    return variants.map(cloneVariant)
  } catch {
    return []
  }
}

export function saveVariants(
  variants: readonly SavedVariant[],
  storage: WriteStorage | null = typeof localStorage === "undefined" ? null : localStorage,
): boolean {
  if (!storage || variants.length > MAX_SAVED_VARIANTS || !variants.every(isSavedVariant) ||
    new Set(variants.map(({ id }) => id)).size !== variants.length) return false
  try {
    const store: VariantsStore = { version: VARIANTS_VERSION, variants: variants.map(cloneVariant) }
    storage.setItem(VARIANTS_STORAGE_KEY, JSON.stringify(store))
    return true
  } catch {
    return false
  }
}

export function createVariant(
  variants: readonly SavedVariant[],
  config: ThemeConfig,
  name?: string,
): SavedVariant[] {
  assertCapacity(variants)
  if (!isThemeConfig(config)) throw new TypeError("Cannot save an invalid theme configuration")
  const variant: SavedVariant = {
    id: localId(),
    name: nextName(variants, name),
    config: cloneConfig(config),
    updatedAt: new Date().toISOString(),
  }
  return [...variants.map(cloneVariant), variant]
}

export function updateVariant(
  variants: readonly SavedVariant[],
  id: string,
  config: ThemeConfig,
  name?: string,
): SavedVariant[] {
  if (!isThemeConfig(config)) throw new TypeError("Cannot save an invalid theme configuration")
  const cleanName = name === undefined ? undefined : validatedName(name)
  return variants.map((variant) => variant.id === id ? {
    ...variant,
    name: cleanName || variant.name,
    config: cloneConfig(config),
    updatedAt: new Date().toISOString(),
  } : cloneVariant(variant))
}

export function renameVariant(variants: readonly SavedVariant[], id: string, name: string): SavedVariant[] {
  const cleanName = validatedName(name)
  return variants.map((variant) => variant.id === id ? {
    ...cloneVariant(variant),
    name: cleanName,
    updatedAt: new Date().toISOString(),
  } : cloneVariant(variant))
}

export function removeVariant(variants: readonly SavedVariant[], id: string): SavedVariant[] {
  return variants.filter((variant) => variant.id !== id).map(cloneVariant)
}

export function duplicateVariant(
  variants: readonly SavedVariant[],
  id: string,
  name?: string,
): SavedVariant[] {
  assertCapacity(variants)
  const source = variants.find((variant) => variant.id === id)
  if (!source) return variants.map(cloneVariant)
  const generatedName = `${source.name} Copy`.slice(0, MAX_VARIANT_NAME_LENGTH).trim()
  return createVariant(variants, source.config, name === undefined ? generatedName : validatedName(name))
}
