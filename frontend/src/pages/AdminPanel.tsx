import { useState } from "react";
import { MOCK_BOOKS } from "@/data/mockBooks";
import SearchBar from "@/components/SearchBar";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Plus, Trash2, Edit } from "lucide-react";
import type { Book } from "@/types";

const AdminPanel = () => {
  const [books, setBooks] = useState<Book[]>(MOCK_BOOKS);
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newBook, setNewBook] = useState({ title: "", author: "", isbn: "", genre: "", year: "" });
  const { toast } = useToast();

  const filtered = books.filter(b => {
    const q = query.toLowerCase();
    return !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const book: Book = {
      id: String(Date.now()),
      title: newBook.title,
      author: newBook.author,
      isbn: newBook.isbn,
      genre: newBook.genre,
      year: parseInt(newBook.year) || 2024,
      available: true,
    };
    setBooks([book, ...books]);
    setNewBook({ title: "", author: "", isbn: "", genre: "", year: "" });
    setShowAdd(false);
    toast({ title: "Book Added", description: `"${book.title}" added to the catalog.` });
  };

  const handleDelete = (id: string) => {
    const book = books.find(b => b.id === id);
    setBooks(books.filter(b => b.id !== id));
    toast({ title: "Book Removed", description: `"${book?.title}" removed from catalog.` });
  };

  const toggleAvailability = (id: string) => {
    setBooks(books.map(b => b.id === id ? { ...b, available: !b.available } : b));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-header flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-primary" /> Admin Panel
          </h1>
          <p className="text-muted-foreground mt-1">Manage the book catalog.</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-accent flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Book
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="glass-card p-6 grid sm:grid-cols-2 gap-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input value={newBook.title} onChange={e => setNewBook({ ...newBook, title: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Author</label>
            <input value={newBook.author} onChange={e => setNewBook({ ...newBook, author: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ISBN</label>
            <input value={newBook.isbn} onChange={e => setNewBook({ ...newBook, isbn: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Genre</label>
            <input value={newBook.genre} onChange={e => setNewBook({ ...newBook, genre: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <input type="number" value={newBook.year} onChange={e => setNewBook({ ...newBook, year: e.target.value })} className="input-field" required />
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full">Save Book</button>
          </div>
        </form>
      )}

      <SearchBar value={query} onChange={setQuery} placeholder="Filter catalog…" />

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-header">Title</th>
              <th className="table-header">Author</th>
              <th className="table-header">ISBN</th>
              <th className="table-header">Status</th>
              <th className="table-header text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(book => (
              <tr key={book.id} className="hover:bg-muted/30 transition-colors">
                <td className="table-cell font-medium">{book.title}</td>
                <td className="table-cell text-muted-foreground">{book.author}</td>
                <td className="table-cell text-muted-foreground font-mono text-xs">{book.isbn}</td>
                <td className="table-cell">
                  <span className={book.available ? "badge-available" : "badge-checked-out"}>
                    {book.available ? "Available" : "Checked Out"}
                  </span>
                </td>
                <td className="table-cell text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => toggleAvailability(book.id)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Toggle availability">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(book.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
