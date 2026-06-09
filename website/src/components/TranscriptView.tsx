import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

import type { CourseGrade, GradeDist, KhsHeader } from "@/types"

interface TranscriptViewProps {
  transcript: CourseGrade[] | null;
  khsHeader: KhsHeader | null;
}

export function TranscriptView({ transcript, khsHeader }: TranscriptViewProps) {
  const [search, setSearch] = React.useState("");

  if (!transcript || !khsHeader) {
    return (
      <Card className="shadow-sm border border-zinc-200 bg-white p-6 text-center">
        <p className="text-zinc-500 text-xs">Academic grade data is not available.</p>
      </Card>
    );
  }

  const filtered = transcript.filter(c => 
    c.nmmk.toLowerCase().includes(search.toLowerCase()) || 
    c.kdmk.toLowerCase().includes(search.toLowerCase())
  );

  const totalCoursesCount = khsHeader.total_nilai.reduce((sum, item) => sum + item.jumlah, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
      {/* Transcript List (Left - 2 columns) */}
      <div className="md:col-span-2 space-y-4">
        <div className="border-b border-zinc-200 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">Academic Grade Transcript</h2>
            <p className="text-xs text-zinc-500 mt-1">List of grades for all courses completed.</p>
          </div>
          
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs px-3 py-1.5 border border-zinc-200 rounded bg-white text-zinc-800 focus:outline-none focus:border-zinc-900 placeholder:text-zinc-400 font-medium"
            />
          </div>
        </div>

        <div className="border border-zinc-200 bg-white rounded shadow-sm overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-zinc-50 z-10 border-b border-zinc-200">
                <TableRow className="hover:bg-transparent border-b border-zinc-200">
                  <TableHead className="w-12 text-center text-zinc-500 py-2.5">No</TableHead>
                  <TableHead className="text-zinc-500 py-2.5">Course Code</TableHead>
                  <TableHead className="text-zinc-500 py-2.5">Course Name</TableHead>
                  <TableHead className="text-center text-zinc-500 py-2.5">Credits</TableHead>
                  <TableHead className="text-center text-zinc-500 py-2.5">Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map((item, index) => (
                    <TableRow key={item.kdmk + index} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/30">
                      <TableCell className="text-center font-mono text-zinc-400 py-2.5 text-[11px]">{index + 1}</TableCell>
                      <TableCell className="font-mono text-[10px] text-zinc-500 py-2.5">{item.kdmk}</TableCell>
                      <TableCell className="font-semibold text-zinc-800 text-xs py-2.5">{item.nmmk}</TableCell>
                      <TableCell className="text-center text-zinc-700 text-xs py-2.5">{item.sks}</TableCell>
                      <TableCell className="text-center py-2.5">
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] font-bold font-mono px-2 py-0.5 border-zinc-200 ${
                            item.nl.startsWith("A") 
                              ? "bg-zinc-900 text-zinc-50 border-zinc-900" 
                              : item.nl.startsWith("B") 
                              ? "bg-zinc-50 text-zinc-850" 
                              : "bg-white text-zinc-500"
                          }`}
                        >
                          {item.nl}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-zinc-400 py-8 text-xs">
                      No courses match your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Academic Summary Stats (Right - 1 column) */}
      <div className="md:col-span-1 space-y-4">
        <div className="border-b border-zinc-200 pb-3">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">Performance Summary</h2>
            <p className="text-xs text-zinc-500 mt-1">Overall academic performance metrics.</p>
        </div>

        <Card className="shadow-sm border border-zinc-200 bg-white">
          <CardContent className="p-6 space-y-6">
            {/* IPK Display */}
            <div className="text-center py-2">
              <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Cumulative Grade Point Average (GPA)</span>
              <span className="text-4xl font-black text-zinc-950 tracking-tighter block mt-1">{khsHeader.ipk.toFixed(2)}</span>
            </div>

            {/* Total SKS Display */}
            <div className="border-t border-zinc-100 pt-4 flex justify-between items-center text-xs">
              <span className="text-zinc-500 font-medium">Total Credits Completed</span>
              <span className="font-mono font-bold text-zinc-900 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded">
                {khsHeader.total_sks} Credits
              </span>
            </div>

            {/* Grade Distribution */}
            <div className="border-t border-zinc-100 pt-4 space-y-3">
              <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Grade Distribution</span>
              <div className="space-y-2">
                {khsHeader.total_nilai
                  .filter(n => n.jumlah > 0)
                  .map((n) => (
                    <div key={n.nilai} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 w-10">
                        <span className="font-bold text-zinc-800 font-mono w-5">{n.nilai}</span>
                      </div>
                      
                      {/* Bar indicator */}
                      <div className="flex-1 bg-zinc-100 h-2 rounded-full overflow-hidden mx-3">
                        <div 
                          className="bg-zinc-950 h-full rounded-full transition-all duration-300"
                          style={{ width: `${(n.jumlah / (totalCoursesCount || 1)) * 100}%` }}
                        />
                      </div>
                      
                      <span className="font-mono font-bold text-zinc-500 text-[11px] w-6 text-right">
                        {n.jumlah}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
