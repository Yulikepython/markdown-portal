/**
 * ローカルDB用のサンプルデータ
 * user1 (27640aa8-9041-7002-c509-d69eb623bffb)
 * 非公開 3 件・公開 3 件を追加 → 計 6 件。
 * user2
 * 既存の文書 1 件（公開）に加えて、非公開 1 件を追加 → 計 2 件。
 * user3
 * user3 として 6 件を新規作成（非公開 3 件・公開 3 件）。
 * user4
 * user4 として 6 件を新規作成（非公開 3 件・公開 3 件）。
 * */
import { Document } from '../types/document';

// サンプルデータ
export const documents: Document[] = [
    // 1) 既存の2件
    {
        id: "1",
        content: "This is the first document.",
        userId: "27640aa8-9041-7002-c509-d69eb623bffb", // user1
        isPublic: false,
        slug: "052bb610-7dc3-4220-af0a-cb13ad04e42c"
    },
    {
        id: "2",
        content: "# TEST title test    This is the second document.",
        userId: "b6631d43-3f5d-43f7-84a5-76a9b8c9820f",
        isPublic: true,
        slug: "a7252e70-2799-4b80-b8ee-a2ca2231c660"
    },

    // 2) user1 (27640aa8-9041-7002-c509-d69eb623bffb)
    //    既存の1件(isPublic: false)に加えて、
    //    追加で Private(非公開)×2, Public(公開)×3 => 計6件に
    {
        id: "3",
        content: "User1 Private document #2",
        userId: "27640aa8-9041-7002-c509-d69eb623bffb",
        isPublic: false,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000003"
    },
    {
        id: "4",
        content: "User1 Private document #3",
        userId: "27640aa8-9041-7002-c509-d69eb623bffb",
        isPublic: false,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000004"
    },
    {
        id: "5",
        content: "User1 Public document #1",
        userId: "27640aa8-9041-7002-c509-d69eb623bffb",
        isPublic: true,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000005"
    },
    {
        id: "6",
        content: "User1 Public document #2",
        userId: "27640aa8-9041-7002-c509-d69eb623bffb",
        isPublic: true,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000006"
    },
    {
        id: "7",
        content: "User1 Public document #3",
        userId: "27640aa8-9041-7002-c509-d69eb623bffb",
        isPublic: true,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000007"
    },

    // 3) user2
    //    既存の1件(isPublic: true) + 非公開×1 => 計2件
    {
        id: "8",
        content: "User2 Private document",
        userId: "b6631d43-3f5d-43f7-84a5-76a9b8c9820f",
        isPublic: false,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000008"
    },

    // 4) user3
    //    公開×3, 非公開×3 => 計6件
    {
        id: "9",
        content: "User3 Private document #1",
        userId: "f38b3dd9-7f81-4f3a-9dc0-291bd5341305",
        isPublic: false,
        slug: "f38b3dd9-7f81-4f3a-9dc0-291bd5341305"
    },
    {
        id: "10",
        content: "User3 Private document #2",
        userId: "f38b3dd9-7f81-4f3a-9dc0-291bd5341305",
        isPublic: false,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000010"
    },
    {
        id: "11",
        content: "User3 Private document #3",
        userId: "f38b3dd9-7f81-4f3a-9dc0-291bd5341305",
        isPublic: false,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000011"
    },
    {
        id: "12",
        content: "User3 Public document #1",
        userId: "f38b3dd9-7f81-4f3a-9dc0-291bd5341305",
        isPublic: true,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000012"
    },
    {
        id: "13",
        content: "User3 Public document #2",
        userId: "f38b3dd9-7f81-4f3a-9dc0-291bd5341305",
        isPublic: true,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000013"
    },
    {
        id: "14",
        content: "User3 Public document #3",
        userId: "f38b3dd9-7f81-4f3a-9dc0-291bd5341305",
        isPublic: true,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000014"
    },

    // 5) user4 (任意のIDを「user4」に設定)
    //    公開×3, 非公開×3 => 計6件
    {
        id: "15",
        content: "User4 Private document #1",
        userId: "be9d19d9-2941-4f4f-9522-374476c842b5",
        isPublic: false,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000015"
    },
    {
        id: "16",
        content: "User4 Private document #2",
        userId: "be9d19d9-2941-4f4f-9522-374476c842b5",
        isPublic: false,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000016"
    },
    {
        id: "17",
        content: "User4 Private document #3",
        userId: "be9d19d9-2941-4f4f-9522-374476c842b5",
        isPublic: false,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000017"
    },
    {
        id: "18",
        content: "User4 Public document #1",
        userId: "be9d19d9-2941-4f4f-9522-374476c842b5",
        isPublic: true,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000018"
    },
    {
        id: "19",
        content: "User4 Public document #2",
        userId: "be9d19d9-2941-4f4f-9522-374476c842b5",
        isPublic: true,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000019"
    },
    {
        id: "20",
        content: "User4 Public document #3",
        userId: "be9d19d9-2941-4f4f-9522-374476c842b5",
        isPublic: true,
        slug: "b1e7ddfa-3d0b-4a1f-a3d3-000000000020"
    },
];

export async function fetchDocuments(): Promise<Document[]> {
    return documents;
}
