import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import type { Student } from "@/types";

interface StudentListProps {
  students: Student[];
  initialSelectedNim: string | null;
}

export function StudentList({ students: initialStudents, initialSelectedNim }: StudentListProps) {
  const [students, setStudents] = React.useState<Student[]>(initialStudents);
  const [selectedNim, setSelectedNim] = React.useState<string | null>(initialSelectedNim);

  // Sync state if initialSelectedNim changes externally (e.g. initial load)
  React.useEffect(() => {
    setSelectedNim(initialSelectedNim);
  }, [initialSelectedNim]);

  // Polling for real-time updates
  React.useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/students');
        const data = await res.json();
        if (res.ok && data.success) {
          setStudents(data.students);
        }
      } catch (err) {
        console.error("Failed to poll students:", err);
      }
    };

    const interval = setInterval(fetchStudents, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSelect = (nim: string) => {
    setSelectedNim(nim);
    
    // 1. Update URL query params without full page reload
    const url = new URL(window.location.href);
    url.searchParams.set('nim', nim);
    window.history.pushState(null, '', url.toString());

    // 2. Dispatch custom event to notify React panel
    window.dispatchEvent(new CustomEvent('student-selected', { detail: { nim } }));
  };

  return (
    <Card className="shadow-sm border border-zinc-200 bg-white overflow-hidden">
      <CardHeader className="bg-zinc-50/50 border-b border-zinc-200 p-4">
        <CardTitle className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Daftar Pengawasan Mahasiswa</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {students.length === 0 ? (
          <div className="p-6 text-center text-zinc-500 text-xs font-medium">
            Belum ada data mahasiswa di database. Mahasiswa perlu melakukan login terlebih dahulu agar data profil & akademis masuk ke database.
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader className="bg-zinc-50">
                <TableRow className="border-b border-zinc-200 hover:bg-transparent">
                  <TableHead className="px-4 py-2.5 text-zinc-500 text-[10px]">Mahasiswa</TableHead>
                  <TableHead className="px-4 py-2.5 text-zinc-500 text-[10px] text-center">Risiko</TableHead>
                  <TableHead className="px-4 py-2.5 text-zinc-500 text-[10px] text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow 
                    key={s.nim}
                    className={`border-b border-zinc-100 hover:bg-zinc-50/40 transition-all ${
                      s.nim === selectedNim ? 'bg-zinc-100/50 font-bold' : ''
                    }`}
                  >
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img 
                          src={s.foto} 
                          alt={s.nama} 
                          className="w-7 h-7 rounded border border-zinc-200 object-cover bg-zinc-50 grayscale"
                        />
                        <div>
                          <div className="text-[11px] font-semibold text-zinc-900 truncate max-w-[120px]">{s.nama}</div>
                          <div className="text-[9px] text-zinc-400 font-mono mt-0.5">{s.nim}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <Badge 
                        className={`text-[8px] px-1.5 py-0.5 font-bold uppercase ${
                          s.risk_level === 'Low'
                            ? 'bg-zinc-50 text-zinc-800 border border-zinc-300'
                            : s.risk_level === 'Medium'
                            ? 'bg-zinc-850 text-zinc-50'
                            : 'bg-zinc-950 text-zinc-50 border-2 border-black'
                        }`}
                      >
                        {s.risk_level === 'Low' ? 'Rendah' : s.risk_level === 'Medium' ? 'Sedang' : 'Tinggi'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 text-[9px] px-2 py-0 border-zinc-200 hover:bg-zinc-100 cursor-pointer"
                        onClick={() => handleSelect(s.nim)}
                      >
                        Pilih
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
