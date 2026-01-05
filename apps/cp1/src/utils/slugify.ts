export function slugify(title: string): string {
        return title
                .toLowerCase()
                .normalize("NFD")                // split accented chars
                .replace(/[\u0300-\u036f]/g, "") // remove accents
                .replace(/[^a-z0-9\s-]/g, "")    // remove accents
                .trim()
                .replace(/\s+/g, "-")            // space to hyphens
                .replace(/-+/g, "-");            // collapse multi-hyphens
}
