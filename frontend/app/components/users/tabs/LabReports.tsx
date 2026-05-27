import React from "react"
import { LabResult } from "@/types"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  FileText,
  Download,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface LabReportsTabProps {
  labResults: LabResult[]
}

const getLabStatusVariant = (status: string): any => {
  switch (status) {
    case "analyzed":
      return "analyzed"
    case "reviewed":
      return "reviewed"
    case "pending_review":
      return "pending_review"
    default:
      return "pending"
  }
}

const getLabStatusIcon = (status: string) => {
  switch (status) {
    case "analyzed":
      return <Clock className="h-5 w-5 text-blue-500" />
    case "reviewed":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />
    case "pending_review":
      return <Clock className="h-5 w-5 text-yellow-500" />
    default:
      return <FileText className="h-5 w-5 text-gray-500" />
  }
}

export const LabReportsTab: React.FC<LabReportsTabProps> = ({ labResults }) => {
  if (labResults.length === 0) {
    return (
      <div className="py-12 text-center">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2 opacity-50" />
        <p className="text-muted-foreground">No lab reports found</p>
      </div>
    )
  }

  // Sort by date descending
  const sortedResults = [...labResults].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="space-y-3">
      {sortedResults.map((result) => (
        <Card key={result._id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-3 flex-1">
                {getLabStatusIcon(result.status)}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground">
                    {result.testType}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {result.bodyPart}
                  </p>
                </div>
              </div>
              <StatusBadge
                variant={getLabStatusVariant(result.status)}
                size="sm"
                showIcon
              >
                {result.status.replace(/_/g, " ").charAt(0).toUpperCase() +
                  result.status.replace(/_/g, " ").slice(1)}
              </StatusBadge>
            </div>

            {/* Analysis Result */}
            <div className="mb-3 p-3 bg-slate-50 dark:bg-slate-900/30 rounded">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                AI Analysis:
              </p>
              <p className="text-sm text-foreground">{result.aiAnalysis}</p>
            </div>

            {/* Doctor Notes */}
            {result.doctorNotes && (
              <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-900">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">
                  Doctor's Notes:
                </p>
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  {result.doctorNotes}
                </p>
              </div>
            )}

            {/* Meta Info and Actions */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {new Date(result.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  title="View Full Report"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>View</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  title="Download Report"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
