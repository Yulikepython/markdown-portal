/**
 * ローカルDB用のサンプルデータ (20件)
 * user1 ... 6件
 * user2 ... 2件
 * user3 ... 6件
 * user4 ... 6件
 */
import { Document } from "../types/document";
import { sampleUseId } from "../middlewares/authLocal";
import { CURRENT_SCHEMA_VERSION } from "../services/document";

// サンプルデータ
export const documents: Document[] = [
    // 1) 既存の2件
    {
        id: 1,
        content: "This is the first document.",
        userId: sampleUseId, // user1
        isPublic: false,
        slug: "05cqb610-7dc3-4220-af0a-cb13ad04e42c",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {}, // とりあえず空オブジェクト
    },
    {
        id: 2,
        content: "# TEST title test    This is the second document.",
        userId: sampleUseId,
        isPublic: true,
        slug: "a7252e70-2799-4b80-b8ee-a2ca2d431c660",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
    },

    // 2) user1 (27640aa8-9041-7002-c509-d69eb623bffb)
    {
        id: 3,
        content: "User1 Private document #2",
        userId: sampleUseId,
        isPublic: false,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000003",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
    },
    {
        id: 4,
        content: "User1 Private document #3",
        userId: sampleUseId,
        isPublic: false,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000004",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
    },
    {
        id: 5,
        content: "User1 Public document #1",
        userId: sampleUseId,
        isPublic: true,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000005",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
    },
    {
        id: 6,
        content: "User1 Public document #2",
        userId: sampleUseId,
        isPublic: true,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000006",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
    },
    // 3) user2
    {
        id: 7,
        content: "User Public document #3",
        userId: "b6631d43-3f5d-43f7-84a5-76a9b8c9820f",
        isPublic: true,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000007",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
    },

    {
        id: 8,
        content: "User2 Private document",
        userId: "b6631d43-3f5d-43f7-84a5-76a9b8c9820f",
        isPublic: false,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000008",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
    },

    // 4) user3
    {
        id: 9,
        content: "User3 Private document #1",
        userId: "f38b3dd9-7f81-4f3a-9dc0-291bd5341305",
        isPublic: false,
        slug: "f38b3dd9-7f81-4f3a-9dc0-291bd5341305",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
    },
    {
        id: 10,
        content: "User3 Private document #2",
        userId: "f38b3dd9-7f81-4f3a-9dc0-291bd5341305",
        isPublic: false,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000010",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
    },
    {
        id: 11,
        content: "User3 Private document #3",
        userId: "f38b3dd9-7f81-4f3a-9dc0-291bd5341305",
        isPublic: false,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000011",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
    },
    {
        id: 12,
        content: "User3 Public document #1",
        userId: "f38b3dd9-7f81-4f3a-9dc0-291bd5341305",
        isPublic: true,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000012",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
    },
    {
        id: 13,
        content: "User3 Public document #2",
        userId: "f38b3dd9-7f81-4f3a-9dc0-291bd5341305",
        isPublic: true,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000013",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
    },
    {
        id: 14,
        content: "User3 Public document #3",
        userId: "f38b3dd9-7f81-4f3a-9dc0-291bd5341305",
        isPublic: true,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000014",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
    },

    // 5) user4 (公開×3, 非公開×3 => 計6件)
    {
        id: 15,
        content: "User4 Private document #1",
        userId: "be9d19d9-2941-4f4f-9522-374476c842b5",
        isPublic: false,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000015",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
    },
    {
        id: 16,
        content: "User4 Private document #2",
        userId: "be9d19d9-2941-4f4f-9522-374476c842b5",
        isPublic: false,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000016",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
    },
    {
        id: 17,
        content: "User4 Private document #3",
        userId: "be9d19d9-2941-4f4f-9522-374476c842b5",
        isPublic: false,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000017",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
    },
    {
        id: 18,
        content: "User4 Public document #1",
        userId: "be9d19d9-2941-4f4f-9522-374476c842b5",
        isPublic: true,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000018",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
    },
    {
        id: 19,
        content: "User4 Public document #2",
        userId: "be9d19d9-2941-4f4f-9522-374476c842b5",
        isPublic: true,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000019",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
    },
    {
        id: 20,
        content: "User4 Public document #3",
        userId: "be9d19d9-2941-4f4f-9522-374476c842b5",
        isPublic: true,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000020",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
    },
];
