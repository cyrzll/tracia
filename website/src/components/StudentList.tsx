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
    <Card className="shadow-sm border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md overflow-hidden text-white rounded-2xl">
      <CardHeader className="bg-zinc-900/40 border-b border-zinc-800/80 p-4">
        <CardTitle className="text-xs font-bold text-white uppercase tracking-wide">Student Watchlist</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {students.length === 0 ? (
          <div className="p-6 text-center text-zinc-500 text-xs font-medium">
            No student data in the database yet. Students need to log in first so their profile & academic data enters the database.
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto" data-lenis-prevent>
            <Table>
              <TableHeader className="bg-zinc-900/60">
                <TableRow className="border-b border-zinc-800/80 hover:bg-transparent">
                  <TableHead className="px-4 py-2.5 text-zinc-400 text-[10px]">Student</TableHead>
                  <TableHead className="px-4 py-2.5 text-zinc-400 text-[10px] text-center">Risk</TableHead>
                  <TableHead className="px-4 py-2.5 text-zinc-400 text-[10px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow 
                    key={s.nim}
                    className={`border-b border-zinc-900/50 hover:bg-zinc-800/30 transition-all ${
                      s.nim === selectedNim ? 'bg-zinc-800/40 font-bold' : ''
                    }`}
                  >
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img 
                          src={s.foto} 
                          alt={s.nama} 
                          className="w-7 h-7 rounded-lg border border-zinc-800 object-cover bg-zinc-900 grayscale"
                        />
                        <div>
                          <div className="text-[11px] font-semibold text-white truncate max-w-[120px]">{s.nama}</div>
                          <div className="text-[9px] text-zinc-500 font-mono mt-0.5">{s.nim}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <Badge 
                        className={`text-[8px] px-1.5 py-0.5 font-bold uppercase rounded-lg border ${
                          s.risk_level === 'Low'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : s.risk_level === 'Medium'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}
                      >
                        {s.risk_level === 'Low' ? 'Low' : s.risk_level === 'Medium' ? 'Medium' : 'High'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 text-[9px] px-2 py-0 border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl cursor-pointer"
                        onClick={() => handleSelect(s.nim)}
                      >
                        Select
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
