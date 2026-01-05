export function calcLastId<T extends { id: number }>(list: Array<T>): number {
        const len: number = list.length;
        let lastId: number = 0;

        if (len > 0) {
                const listIds = list.map(item => item.id);
                lastId = Math.max(...listIds);
        }

        return lastId + 1;
}
