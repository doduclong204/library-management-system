export interface Borrower {
  id: string;
  email: string;
  name: string;
  studentId?: string;
}

export const MOCK_BORROWERS: Borrower[] = [
  { id: "B001", email: "minhanh@gmail.com", name: "Nguyễn Minh Anh", studentId: "SV2024001" },
  { id: "B002", email: "vanbinh@gmail.com", name: "Trần Văn Bình", studentId: "SV2024002" },
  { id: "B003", email: "thicam@gmail.com", name: "Lê Thị Cẩm", studentId: "SV2024003" },
  { id: "B004", email: "ducduy@gmail.com", name: "Phạm Đức Duy", studentId: "SV2024004" },
  { id: "B005", email: "hoangem@gmail.com", name: "Hoàng Thị Em", studentId: "SV2024005" },
  { id: "B006", email: "quanghai@gmail.com", name: "Ngô Quang Hải", studentId: "SV2024006" },
];
