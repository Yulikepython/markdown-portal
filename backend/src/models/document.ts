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
        content: "This is the first document.",
        userId: sampleUseId, // user1
        isPublic: false,
        slug: "05cqb610-7dc3-4220-af0a-cb13ad04e42c",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {}, // とりあえず空オブジェクト
        createdAt: "2021-09-01T00:00:00.000Z",
        updatedAt: "2021-09-01T00:00:00.000Z",
    },
    {
        content: "# TEST title test    This is the second document.",
        userId: sampleUseId,
        isPublic: true,
        slug: "a7252e70-2799-4b80-b8ee-a2ca2d431c660",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
        createdAt: "2021-09-02T00:00:00.000Z",
        updatedAt: "2021-09-03T00:00:00.000Z",
    },

    // 2) user1 (27640aa8-9041-7002-c509-d69eb623bffb)
    {
        content: "User1 Private document #2",
        userId: sampleUseId,
        isPublic: false,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000003",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
        createdAt: "2021-09-03T00:00:00.000Z",
        updatedAt: "2021-09-03T00:00:00.000Z",
    },
    {
        content: "User1 Private document #3",
        userId: sampleUseId,
        isPublic: false,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000004",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
        createdAt: "2021-09-04T00:00:00.000Z",
        updatedAt: "2021-09-04T00:00:00.000Z",
    },
    {
        content: "User1 Public document #1",
        userId: sampleUseId,
        isPublic: true,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000005",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
        createdAt: "2021-09-05T00:00:00.000Z",
        updatedAt: "2021-09-05T00:00:00.000Z",
    },
    {
        content: "User1 Public document #2",
        userId: sampleUseId,
        isPublic: true,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000006",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
        createdAt: "2021-09-06T00:00:00.000Z",
        updatedAt: "2021-09-06T00:00:00.000Z",
    },
    // 3) user2
    {
        content: "User Public document #3",
        userId: "b6631d43-3f5d-43f7-84a5-76a9b8c9820f",
        isPublic: true,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000007",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
        createdAt: "2021-09-07T00:00:00.000Z",
        updatedAt: "2021-09-07T00:00:00.000Z",
    },

    {
        content: "User2 Private document",
        userId: "b6631d43-3f5d-43f7-84a5-76a9b8c9820f",
        isPublic: false,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000008",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
        createdAt: "2021-09-08T00:00:00.000Z",
        updatedAt: "2021-09-08T00:00:00.000Z",
    },

    // 4) user3
    {
        content: "User3 Private document #1",
        userId: "f38b3dd9-7f81-4f3a-9dc0-291bd5341305",
        isPublic: false,
        slug: "f38b3dd9-7f81-4f3a-9dc0-291bd5341305",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
        createdAt: "2021-09-09T00:00:00.000Z",
        updatedAt: "2021-09-08T00:00:00.000Z",
    },
    {
        content: "User3 Private document #2",
        userId: "f38b3dd9-7f81-4f3a-9dc0-291bd5341305",
        isPublic: false,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000010",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
        createdAt: "2021-09-10T00:00:00.000Z",
        updatedAt: "2021-09-10T00:00:00.000Z",
    },
    {
        content: "User3 Private document #3",
        userId: "f38b3dd9-7f81-4f3a-9dc0-291bd5341305",
        isPublic: false,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000011",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
        createdAt: "2021-09-11T00:00:00.000Z",
        updatedAt: "2021-09-11T00:00:00.000Z",
    },
    {
        content: "User3 Public document #1",
        userId: "f38b3dd9-7f81-4f3a-9dc0-291bd5341305",
        isPublic: true,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000012",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
        createdAt: "2021-09-12T00:00:00.000Z",
        updatedAt: "2021-09-12T00:00:00.000Z",
    },
    {
        content: "User3 Public document #2",
        userId: "f38b3dd9-7f81-4f3a-9dc0-291bd5341305",
        isPublic: true,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000013",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
        createdAt: "2021-09-13T00:00:00.000Z",
        updatedAt: "2021-09-13T00:00:00.000Z",
    },
    {
        content: "User3 Public document #3",
        userId: "f38b3dd9-7f81-4f3a-9dc0-291bd5341305",
        isPublic: true,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000014",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
        createdAt: "2021-09-14T00:00:00.000Z",
        updatedAt: "2021-09-14T00:00:00.000Z",
    },

    // 5) user4 (公開×3, 非公開×3 => 計6件)
    {
        content: "User4 Private document #1",
        userId: "be9d19d9-2941-4f4f-9522-374476c842b5",
        isPublic: false,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000015",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
        createdAt: "2021-09-15T00:00:00.000Z",
        updatedAt: "2021-09-15T00:00:00.000Z",
    },
    {
        content: "User4 Private document #2",
        userId: "be9d19d9-2941-4f4f-9522-374476c842b5",
        isPublic: false,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000016",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
        createdAt: "2021-09-16T00:00:00.000Z",
        updatedAt: "2021-09-16T00:00:00.000Z",
    },
    {
        content: "User4 Private document #3",
        userId: "be9d19d9-2941-4f4f-9522-374476c842b5",
        isPublic: false,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000017",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
        createdAt: "2021-09-17T00:00:00.000Z",
        updatedAt: "2021-09-17T00:00:00.000Z",
    },
    {
        content: "User4 Public document #1",
        userId: "be9d19d9-2941-4f4f-9522-374476c842b5",
        isPublic: true,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000018",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
        createdAt: "2021-09-18T00:00:00.000Z",
        updatedAt: "2021-09-18T00:00:00.000Z",
    },
    {
        content: "User4 Public document #2",
        userId: "be9d19d9-2941-4f4f-9522-374476c842b5",
        isPublic: true,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000019",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
        createdAt: "2021-09-19T00:00:00.000Z",
        updatedAt: "2021-09-19T00:00:00.000Z",
    },
    {
        content: "User4 Public document #3",
        userId: "be9d19d9-2941-4f4f-9522-374476c842b5",
        isPublic: true,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000020",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        docMetadata: {},
        createdAt: "2021-09-20T00:00:00.000Z",
        updatedAt: "2021-09-20T00:00:00.000Z",
    },
];
