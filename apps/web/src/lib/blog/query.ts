import type {
	MarbleAuthorList,
	MarbleCategoryList,
	MarblePost,
	MarblePostList,
	MarbleTagList,
} from "@/types/blog";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSanitize from "rehype-sanitize";

const url =
	process.env.NEXT_PUBLIC_MARBLE_API_URL ?? "https://api.marblecms.com";
const key = process.env.MARBLE_WORKSPACE_KEY ?? "cmd4iw9mm0006l804kwqv0k46";

const DEFAULT_PAGINATION = {
	limit: 10,
	currpage: 1,
	nextPage: null,
	prevPage: null,
	totalItems: 0,
	totalPages: 0,
};

async function fetchFromMarble<T>({
	endpoint,
}: {
	endpoint: string;
}): Promise<T | null> {
	try {
		const response = await fetch(`${url}/${key}/${endpoint}`);
		if (!response.ok) {
			console.warn(
				`Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`,
			);
			return null;
		}
		return (await response.json()) as T;
	} catch (error) {
		console.error(`Error fetching ${endpoint}:`, error);
		return null;
	}
}

export async function getPosts(): Promise<MarblePostList> {
	const data = await fetchFromMarble<MarblePostList>({ endpoint: "posts" });
	return (
		data ?? {
			posts: [],
			pagination: DEFAULT_PAGINATION,
		}
	);
}

export async function getTags(): Promise<MarbleTagList> {
	const data = await fetchFromMarble<MarbleTagList>({ endpoint: "tags" });
	return (
		data ?? {
			tags: [],
			pagination: DEFAULT_PAGINATION,
		}
	);
}

export async function getSinglePost({
	slug,
}: {
	slug: string;
}): Promise<MarblePost | null> {
	return fetchFromMarble<MarblePost>({ endpoint: `posts/${slug}` });
}

export async function getCategories(): Promise<MarbleCategoryList> {
	const data = await fetchFromMarble<MarbleCategoryList>({
		endpoint: "categories",
	});
	return (
		data ?? {
			categories: [],
			pagination: DEFAULT_PAGINATION,
		}
	);
}

export async function getAuthors(): Promise<MarbleAuthorList> {
	const data = await fetchFromMarble<MarbleAuthorList>({ endpoint: "authors" });
	return (
		data ?? {
			authors: [],
			pagination: DEFAULT_PAGINATION,
		}
	);
}

export async function processHtmlContent({
	html,
}: {
	html: string;
}): Promise<string> {
	const processor = unified()
		.use(rehypeSanitize)
		.use(rehypeParse, { fragment: true })
		.use(rehypeSlug)
		.use(rehypeAutolinkHeadings, { behavior: "append" })
		.use(rehypeStringify);

	const file = await processor.process({ value: html, type: "html" });
	return String(file);
}
