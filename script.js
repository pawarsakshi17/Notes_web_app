
class NotesApp {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('personalNotes')) || [];
        this.currentEditId = null;
        this.searchTerm = '';
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderNotes();
    }

    bindEvents() {
        document.getElementById('addNoteBtn').addEventListener('click', () => this.openNoteModal());
        document.getElementById('closeModal').addEventListener('click', () => this.closeNoteModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeNoteModal());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveNote());
        document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e.target.value));

        // Close modal when clicking backdrop
        document.getElementById('noteModal').addEventListener('click', (e) => {
            if (e.target.id === 'noteModal') {
                this.closeNoteModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeNoteModal();
            }
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.openNoteModal();
            }
        });
    }

    openNoteModal(noteId = null) {
        this.currentEditId = noteId;
        const modal = document.getElementById('noteModal');
        const title = document.getElementById('modalTitle');
        const noteTitle = document.getElementById('noteTitle');
        const noteContent = document.getElementById('noteContent');

        if (noteId) {
            const note = this.notes.find(n => n.id === noteId);
            title.textContent = 'Edit Note';
            noteTitle.value = note.title;
            noteContent.value = note.content;
        } else {
            title.textContent = 'Add New Note';
            noteTitle.value = '';
            noteContent.value = '';
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        noteTitle.focus();
    }

    closeNoteModal() {
        const modal = document.getElementById('noteModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        this.currentEditId = null;
    }

    saveNote() {
        const title = document.getElementById('noteTitle').value.trim();
        const content = document.getElementById('noteContent').value.trim();

        if (!title && !content) {
            alert('Please add a title or content to your note.');
            return;
        }

        const noteData = {
            title: title || 'Untitled Note',
            content: content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (this.currentEditId) {
            // Edit existing note
            const noteIndex = this.notes.findIndex(n => n.id === this.currentEditId);
            this.notes[noteIndex] = { ...this.notes[noteIndex], ...noteData };
        } else {
            // Add new note
            noteData.id = Date.now().toString();
            this.notes.unshift(noteData);
        }

        this.saveToStorage();
        this.renderNotes();
        this.closeNoteModal();
    }

    deleteNote(noteId) {
        if (confirm('Are you sure you want to delete this note?')) {
            this.notes = this.notes.filter(n => n.id !== noteId);
            this.saveToStorage();
            this.renderNotes();
        }
    }

    handleSearch(term) {
        this.searchTerm = term.toLowerCase();
        this.renderNotes();
    }

    highlightSearchTerm(text, term) {
        if (!term) return text;
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays - 1} days ago`;
        return date.toLocaleDateString();
    }

    renderNotes() {
        const container = document.getElementById('notesContainer');
        const emptyState = document.getElementById('emptyState');

        let filteredNotes = this.notes;

        if (this.searchTerm) {
            filteredNotes = this.notes.filter(note =>
                note.title.toLowerCase().includes(this.searchTerm) ||
                note.content.toLowerCase().includes(this.searchTerm)
            );
        }

        if (filteredNotes.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        container.innerHTML = filteredNotes.map(note => `
                    <div class="note-card rounded-2xl p-6 text-white shadow-lg cursor-pointer group">
                        <div class="flex justify-between items-start mb-3">
                            <h3 class="text-lg font-semibold truncate pr-2">${this.highlightSearchTerm(note.title, this.searchTerm)}</h3>
                            <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button 
                                    onclick="notesApp.openNoteModal('${note.id}')"
                                    class="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-2 transition-all duration-200"
                                    title="Edit note"
                                >
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                    </svg>
                                </button>
                                <button 
                                    onclick="notesApp.deleteNote('${note.id}')"
                                    class="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-2 transition-all duration-200"
                                    title="Delete note"
                                >
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <p class="text-white text-opacity-90 text-sm line-clamp-4 mb-4 leading-relaxed">${this.highlightSearchTerm(note.content.substring(0, 150) + (note.content.length > 150 ? '...' : ''), this.searchTerm)}</p>
                        <div class="text-xs text-white text-opacity-70">
                            ${this.formatDate(note.updatedAt)}
                        </div>
                    </div>
                `).join('');
    }

    saveToStorage() {
        localStorage.setItem('personalNotes', JSON.stringify(this.notes));
    }
}

// Initialize the app
const notesApp = new NotesApp();

// Add some sample notes if none exist
if (notesApp.notes.length === 0) {
    const sampleNotes = [
        {
            id: '1',
            title: 'Welcome to Personal Notes! 🎉',
            content: 'This is your personal notes app. You can create, edit, delete, and search through your notes. Click the edit button to modify this note or create new ones using the "Add New Note" button.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: '2',
            title: 'Quick Tips',
            content: 'Use Ctrl+N to quickly add a new note. The search function works on both titles and content. Your notes are automatically saved to your browser\'s local storage.',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString()
        }
    ];

    notesApp.notes = sampleNotes;
    notesApp.saveToStorage();
    notesApp.renderNotes();
}


