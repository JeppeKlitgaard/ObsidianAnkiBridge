import { AnkiField, AnkiFields, ModelName } from "./note"

// General Response
export interface ResponseEntity {
    result: any
    error: any
}

// Multi
export interface ActionEntity {
    action: string
    params?: Record<string, any>
}

export interface MultiRequest {
    actions: Array<ActionEntity>
}

export interface UploadMethods {
    data?: string
    path?: string
    url?: string
}

// StoreMediaFile
export interface StoreMediaFileRequest extends UploadMethods {
    filename: string
}

export type StoreMediaFileResponse = string

// ---
export interface AssetEntity extends UploadMethods {
    filename: string
    skipHash?: string
    fields: Array<string>
}

export interface AssetsEntity {
    audio?: Array<AssetEntity>
    video?: Array<AssetEntity>
    picture?: Array<AssetEntity>
}

export interface NoteOptionsEntity {
    allowDuplicate: boolean
    duplicateScope: string
}

export interface DuplicateScopeOptionsEntity {
    deckName?: string | null
    checkChildren?: boolean
    checkAllModels?: boolean
}

// CardsInfo
export interface CardsInfoRequest {
    cards: Array<number>
}

export interface CardsInfoEntity {
    answer: string
    question: string
    deckName: string
    modelName: ModelName
    fieldOrder: number
    fields: FieldEntity
    css: string
    cardId: number
    interval: number
    note: number
    ord: number
    type: number
    queue: number
    due: number
    reps: number
    lapses: number
    left: number
    mod: number
}

export type CardsInfoResponse = Array<CardsInfoEntity>

// ChangeDeck
export interface ChangeDeckRequest {
    cards: Array<number>
    deck: string
}

export type ChangeDeckResponse = null

// AddNote
export interface AddNoteEntity extends AssetsEntity {
    deckName: string
    modelName: ModelName
    fields: AnkiFields
    options?: NoteOptionsEntity
    tags: Array<string>
}

export interface AddNoteRequest {
    note: AddNoteEntity
}

export type AddNoteResponse = number

// DeleteNotes
export interface DeleteNotesRequest {
    notes: Array<number>
}

export type DeleteNoteResponse = null

// UpdateNoteFields
export interface UpdateNoteFieldsEntity extends AssetsEntity {
    id: number
    fields: AnkiFields
}

export interface UpdateNoteFieldsRequest {
    note: UpdateNoteFieldsEntity
}

export type UpdateNoteFieldsResponse = null

// AddTags
export interface AddTagsRequest {
    notes: Array<number>
    tags: string
}

export type AddTagsResponse = null

// RemoveTags
export interface RemoveTagsRequest {
    notes: Array<number>
    tags: string
}

export type RemoveTagsResponse = null

// NotesInfo
export interface NotesInfoRequest {
    notes: Array<number>
}

export interface FieldEntity {
    value: string
    order: number
}

export interface NotesInfoResponseEntity {
    noteId: number
    modelName: ModelName
    tags: Array<string>
    cards: Array<number>
    fields: Record<AnkiField, FieldEntity>
}

export type NotesInfoResponse = Array<NotesInfoResponseEntity>
