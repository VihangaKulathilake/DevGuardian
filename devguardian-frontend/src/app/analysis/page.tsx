"use client";

import * as React from "react";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/navbar/Sidebar";
import IssueCard from "@/components/dashboard/IssueCard";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Play, Sparkles, AlertTriangle, ShieldCheck, GitPullRequest } from "lucide-react";

export default function AnalysisPage() {
  const [isScanning, setIsScanning] = React.useState(false);
  const [scanResult, setScanResult] = React.useState("idle");

  const runScan = () => {
    setIsScanning(true);
    setScanResult("scanning");
    setTimeout(() => {
      setIsScanning(false);
      setScanResult("completed");
    }, 2000);
  };

  const sampleIssues = [
    {
      title: "Hardcoded API Token in Config",
      description: "Found a sensitive credential committed directly into the application environment settings file.",
      severity: "critical" as const,
      filePath: "config/app.json",
      lineNo: 12,
      category: "security" as const,
      codeSnippet: `"api_secret": "sk_live_51Nz8P3K9..."`,
    },
    {
      title: "SQL Injection in User Login Flow",
      description: "SQL query constructed dynamically using direct input interpolation. This allows hackers to execute custom DB queries.",
      severity: "critical" as const,
      filePath: "src/services/db.ts",
      lineNo: 42,
      category: "security" as const,
      codeSnippet: `const query = "SELECT * FROM users WHERE id = " + req.query.id;`,
    },
    {
      title: "Inefficient Nested Loop in Repository Lookups",
      description: "An O(N^2) nested loop was detected which can lead to performance degradation under high query load.",
      severity: "medium" as const,
      filePath: "src/utils/repos.ts",
      lineNo: 89,
      category: "quality" as const,
      codeSnippet: `repos.map(r => users.find(u => u.id === r.ownerId))`,
    },
    {
      title: "Missing Dependency Security Lockfile",
      description: "No lockfile detected. This can lead to non-deterministic package installations in production environments.",
      severity: "low" as const,
      filePath: "package.json",
      lineNo: 1,
      category: "quality" as const,
      codeSnippet: `// No package-lock.json or yarn.lock present at root.`,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar currentPath="/analysis" />
        <main className="flex-1 p-6 md:p-8 bg-background overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Security Analysis
                </h1>
                <Badge variant="neutral">payment-gateway</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Run security audit scans and manage auto-detected vulnerabilities.
              </p>
            </div>
            <Button
              onClick={runScan}
              loading={isScanning}
              className="sm:w-auto shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5"
            >
              <Play className="h-4 w-4" fill="currentColor" />
              Trigger Full Scan
            </Button>
          </div>

          {/* AI Summary Section */}
          <section className="mb-8">
            <Card className="border-primary/20 bg-primary/5 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-white mb-2">DevGuardian Security Summary</h3>
                  <div className="text-xs text-muted-foreground leading-relaxed space-y-3">
                    <p>
                      DevGuardian analyzed <strong className="text-white">payment-gateway</strong> repository. Here are the findings and suggested remediations:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground/90">
                      <li>Detected <strong className="text-white">2 Critical Vulnerabilities</strong> relating to hardcoded secrets and query construction.</li>
                      <li>Suggested <strong>1 automatic remediation patch</strong> for the SQL injection flaw.</li>
                      <li>Performance and dependency check reports are clean, with minor code smells.</li>
                    </ul>
                    <div className="pt-2 flex items-center gap-2">
                      <Button variant="secondary" size="sm" className="h-8 gap-1.5">
                        <GitPullRequest className="h-3.5 w-3.5" />
                        Apply Remediations
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Issues List Grid */}
          <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-white">Vulnerabilities & Issues ({sampleIssues.length})</h3>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-destructive" /> Critical</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Warning</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Info</span>
              </div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              {sampleIssues.map((issue, index) => (
                <IssueCard key={index} {...issue} />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
