import { Vault as RealVault } from 'obsidian'
import { TFolder as RealTFolder } from 'obsidian'

export const Vault = jest.fn(() => {
    return {
        default: jest.fn(),
    }
}) as unknown as jest.Mocked<RealVault>

export const TFolder = jest.fn(() => {
    return {
        default: jest.fn()
    }
}) as unknown as jest.Mocked<RealTFolder>
