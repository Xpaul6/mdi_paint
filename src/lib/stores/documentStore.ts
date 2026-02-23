import { writable, get } from 'svelte/store';

// Defines the shape of a single document/tab
export type Document = {
	id: string;
	name: string;
	data: string | null; // A data URL of the canvas content
	isDirty: boolean;
};

type DocumentStoreState = {
	documents: Document[];
	activeDocumentId: string | null;
};

function createDocumentStore() {
	const { subscribe, update } = writable<DocumentStoreState>({
		documents: [],
		activeDocumentId: null
	});

	// Initial document
	addDocument();

	function getUniqueName(baseName: string, documents: Document[]): string {
		let name = baseName.split('.')[0];
		let finalName = name;
		let counter = 1;
		while (documents.some((doc) => doc.name === finalName)) {
			finalName = `${name} (${counter++})`;
		}
		return finalName;
	}

	function addDocument(data: string | null = null, name = 'Untitled') {
		const newId = crypto.randomUUID();
		let newDoc: Document;

		update((state) => {
			newDoc = {
				id: newId,
				name: getUniqueName(name, state.documents),
				data: data,
				isDirty: data === null
			};
			return {
				documents: [...state.documents, newDoc],
				activeDocumentId: newId
			};
		});
	}

	function setActive(id: string) {
		update((state) => {
			if (state.documents.find((d) => d.id === id)) {
				return { ...state, activeDocumentId: id };
			}
			return state;
		});
	}

	function closeDocument(id: string) {
		update((state) => {
			const docIndex = state.documents.findIndex((d) => d.id === id);
			if (docIndex === -1) return state;

			let nextActiveId = state.activeDocumentId;
			if (state.activeDocumentId === id) {
				if (state.documents.length === 1) {
					nextActiveId = null;
				} else if (docIndex > 0) {
					nextActiveId = state.documents[docIndex - 1].id;
				} else {
					nextActiveId = state.documents[1]?.id ?? null;
				}
			}

			const newDocuments = state.documents.filter((doc) => doc.id !== id);

			// If the currently active document is closed, we might need to add a new default one
			if (newDocuments.length === 0) {
				const defaultDocId = crypto.randomUUID();
				return {
					documents: [{ id: defaultDocId, name: 'Untitled', data: null, isDirty: true }],
					activeDocumentId: defaultDocId
				};
			}

			return { documents: newDocuments, activeDocumentId: nextActiveId };
		});
	}

	function updateActiveDocumentData(data: string) {
		update((state) => {
			const activeDoc = state.documents.find((d) => d.id === state.activeDocumentId);
			if (activeDoc) {
				activeDoc.data = data;
				activeDoc.isDirty = true;
			}
			return { ...state };
		});
	}

	function setActiveDocumentSaved() {
		update((state) => {
			const activeDoc = state.documents.find((d) => d.id === state.activeDocumentId);
			if (activeDoc) {
				activeDoc.isDirty = false;
			}
			return { ...state };
		});
	}

	return {
		subscribe,
		addDocument,
		setActive,
		closeDocument,
		updateActiveDocumentData,
		setActiveDocumentSaved
	};
}

// Export a singleton instance of the store
export const documentStore = createDocumentStore();

