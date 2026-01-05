export interface Post {
        id: number;
        slug: string;
        title: string;
        content: string;
}

export type CreatePost = Omit<Post, "id">;

const posts: Post[] = [
        {
                id: 1,
                title: "Post 1",
                slug: "post-1",
                content: "Post 1 Content my boi",
        },
        {
                id: 2,
                title: "Post-2-boi",
                slug: "post-2-boi",
                content: "Post 2 Content",
        },
];

export function insertPost(data: CreatePost): Post {
        const len: number = posts.length;
        let lastId: number = 0;

        if (len > 0) {
                lastId = posts[len - 1].id;
        }

        const id: number = lastId + 1;
        const post: Post = {
                id,
                ...data,
        };

        posts.push(post);
        return post;
}

export function getPosts(): Post[] {
        return posts;
};

export function getPostById(id: number): Post | undefined {
        return posts.find((post) => post.id === id);
};

export function getPostBySlug(slug: string): Post | undefined {
        return posts.find((post) => post.slug === slug);
};

export function deletePostById(id: number): Post | undefined {
        const idx = posts.findIndex((post) => post.id === id);

        if (idx === -1) {
                return;
        }

        return posts.splice(idx, 1)[0];
}
