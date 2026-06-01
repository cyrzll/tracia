import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Course {
  nmmk: string;
  klpk: string;
  kdmk: string;
  sks: number;
  sts: string;
}

interface SemesterKrs {
  ta: string;
  kode_ta: string;
  krs: Course[];
}

interface KrsAccordionProps {
  currentKrs: SemesterKrs | null;
  pastKrs: SemesterKrs[] | null;
}

export function KrsAccordion({ currentKrs, pastKrs }: KrsAccordionProps) {
  // Store the active (open) semester TA. Default is the current TA if it exists.
  const [openSemester, setOpenSemester] = React.useState<string | null>(
    currentKrs ? currentKrs.ta : null
  );

  const toggleSemester = (ta: string) => {
    setOpenSemester(openSemester === ta ? null : ta);
  };

  const renderKrsTable = (krs: Course[]) => {
    if (!krs || krs.length === 0) {
      return <div className="text-zinc-500 py-4 text-center text-xs">Tidak ada mata kuliah yang diambil.</div>;
    }

    const totalSks = krs.reduce((sum, item) => sum + item.sks, 0);

    return (
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-zinc-200 hover:bg-transparent">
              <TableHead className="w-12 text-center text-zinc-500 py-2.5">No</TableHead>
              <TableHead className="text-zinc-500 py-2.5">Kode MK</TableHead>
              <TableHead className="text-zinc-500 py-2.5">Nama MK</TableHead>
              <TableHead className="text-zinc-500 py-2.5">Kelompok</TableHead>
              <TableHead className="text-center text-zinc-500 py-2.5">SKS</TableHead>
              <TableHead className="text-center text-zinc-500 py-2.5">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {krs.map((item, index) => (
              <TableRow key={item.kdmk + index} className="border-b border-zinc-200 hover:bg-zinc-50/30">
                <TableCell className="text-center font-mono text-zinc-500 py-2">{index + 1}</TableCell>
                <TableCell className="font-mono text-[10px] text-zinc-500 py-2">{item.kdmk}</TableCell>
                <TableCell className="font-semibold text-zinc-800 text-xs py-2">{item.nmmk}</TableCell>
                <TableCell className="text-zinc-600 text-xs py-2">{item.klpk}</TableCell>
                <TableCell className="text-center font-bold text-zinc-800 text-xs py-2">{item.sks}</TableCell>
                <TableCell className="text-center py-2">
                  <Badge variant="outline" className="text-[9px] border-zinc-300 text-zinc-700 bg-zinc-50">
                    {item.sts}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex justify-between items-center bg-zinc-50 border border-zinc-200 p-4 rounded text-xs">
          <span className="font-bold text-zinc-600 uppercase tracking-wide">Total SKS Diambil:</span>
          <span className="font-mono font-black text-sm text-zinc-950">{totalSks} SKS</span>
        </div>
      </div>
    );
  };

  // Combine current and past KRS for the accordion list
  const allSemesters: SemesterKrs[] = [];
  if (currentKrs) {
    allSemesters.push(currentKrs);
  }
  if (pastKrs) {
    // Avoid duplicating current semester if it's also in get-krs-lalu
    pastKrs.forEach(item => {
      if (!allSemesters.some(s => s.ta === item.ta)) {
        allSemesters.push(item);
      }
    });
  }

  if (allSemesters.length === 0) {
    return (
      <Card className="shadow-sm border border-zinc-200 bg-white p-6 text-center">
        <p className="text-zinc-500 text-xs">Belum ada riwayat Kartu Rencana Studi (KRS) yang tercatat.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {allSemesters.map((sem) => {
        const isOpen = openSemester === sem.ta;
        const isCurrent = currentKrs && sem.ta === currentKrs.ta;
        return (
          <div key={sem.ta} className="border border-zinc-200 bg-white rounded overflow-hidden shadow-sm">
            {/* Accordion Trigger Button */}
            <button
              type="button"
              onClick={() => toggleSemester(sem.ta)}
              className="flex w-full items-center justify-between p-4 text-xs font-bold uppercase tracking-wide text-zinc-900 bg-zinc-50/50 hover:bg-zinc-50 transition-all text-left cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <span>Semester {sem.ta}</span>
                {isCurrent && (
                  <Badge variant="default" className="text-[8px] px-1.5 py-0.2 bg-zinc-900 text-zinc-50">
                    Aktif
                  </Badge>
                )}
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {/* Accordion Content */}
            <div
              className={`transition-all duration-200 overflow-hidden ${isOpen ? 'h-auto border-t border-zinc-200' : 'h-0 opacity-0'}`}
            >
              {isOpen && (
                <div className="p-4 bg-white">
                  {renderKrsTable(sem.krs)}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
