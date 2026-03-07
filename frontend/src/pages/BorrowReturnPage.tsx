import { useState } from "react";
import { MOCK_BOOKS } from "@/data/mockBooks";
import SearchBar from "@/components/SearchBar";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeftRight, BookOpen, Undo2 } from "lucide-react";

const BorrowReturnPage = () => {
  const [tab, setTab] = useState<"borrow" | "return">("borrow");
  const [bookQuery, setBookQuery] = useState("");
  const [userId, setUserId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedBookId, setSelectedBookId] = useState("");
  const [fineResult, setFineResult] = useState<number | null>(null);
  const { toast } = useToast();

  const matchedBooks = bookQuery.length > 1
    ? MOCK_BOOKS.filter(b =>
        b.title.toLowerCase().includes(bookQuery.toLowerCase()) ||
        b.isbn.includes(bookQuery)
      ).slice(0, 5)
    : [];

  const handleBorrow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId || !userId || !dueDate) {
      toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    // In production: call borrowBook API
    toast({ title: "Book Borrowed!", description: `Book checked out to user ${userId}. Due: ${dueDate}` });
    setSelectedBookId("");
    setUserId("");
    setDueDate("");
    setBookQuery("");
  };

  const handleReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId || !returnDate) {
      toast({ title: "Missing fields", description: "Select a book and return date.", variant: "destructive" });
      return;
    }
    // Simulate fine calculation
    const book = MOCK_BOOKS.find(b => b.id === selectedBookId);
    const daysOverdue = Math.max(0, Math.floor((new Date(returnDate).getTime() - new Date("2026-03-10").getTime()) / 86400000));
    const fine = daysOverdue * 0.50;
    setFineResult(fine);
    toast({
      title: "Book Returned!",
      description: fine > 0 ? `Fine: $${fine.toFixed(2)} (${daysOverdue} days overdue)` : "No fine. Returned on time!",
    });
  };

  const selectedBook = MOCK_BOOKS.find(b => b.id === selectedBookId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Borrow & Return</h1>
        <p className="text-muted-foreground mt-1">Scan or search a book to process transactions.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        <button
          onClick={() => { setTab("borrow"); setFineResult(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === "borrow" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <BookOpen className="w-4 h-4" /> Borrow
        </button>
        <button
          onClick={() => { setTab("return"); setFineResult(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === "return" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Undo2 className="w-4 h-4" /> Return
        </button>
      </div>

      <div className="glass-card p-6 max-w-xl">
        {/* Book search / barcode simulation */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-1.5">Scan / Search Book</label>
          <SearchBar value={bookQuery} onChange={setBookQuery} placeholder="Enter title or ISBN (simulated barcode scan)…" />
          {matchedBooks.length > 0 && !selectedBookId && (
            <ul className="mt-2 border border-border rounded-lg overflow-hidden">
              {matchedBooks.map(b => (
                <li key={b.id}>
                  <button
                    onClick={() => { setSelectedBookId(b.id); setBookQuery(b.title); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors flex items-center justify-between text-sm"
                  >
                    <span>{b.title} — <span className="text-muted-foreground">{b.author}</span></span>
                    <span className={b.available ? "badge-available" : "badge-checked-out"}>
                      {b.available ? "Available" : "Checked Out"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {selectedBook && (
            <div className="mt-2 p-3 bg-primary/5 rounded-lg text-sm flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-primary" />
              Selected: <strong>{selectedBook.title}</strong> ({selectedBook.isbn})
              <button onClick={() => { setSelectedBookId(""); setBookQuery(""); }} className="ml-auto text-xs text-muted-foreground underline">Clear</button>
            </div>
          )}
        </div>

        {tab === "borrow" ? (
          <form onSubmit={handleBorrow} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">User ID</label>
              <input value={userId} onChange={e => setUserId(e.target.value)} className="input-field" placeholder="e.g. STU001" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="input-field" required />
            </div>
            <button type="submit" className="btn-primary w-full">Process Borrowing</button>
          </form>
        ) : (
          <form onSubmit={handleReturn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Return Date</label>
              <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} className="input-field" required />
            </div>
            <button type="submit" className="btn-primary w-full">Process Return</button>

            {fineResult !== null && (
              <div className={`p-4 rounded-lg text-sm font-medium ${fineResult > 0 ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                {fineResult > 0 ? `⚠️ Overdue fine: $${fineResult.toFixed(2)}` : "✓ No fine — returned on time!"}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default BorrowReturnPage;
