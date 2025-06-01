import { BaseExportAdapter } from "./export-adapter"
import type { Project, ExportOptions, ExportResult } from "../types"
import jsPDF from "jspdf"

export class PDFExportAdapter extends BaseExportAdapter {
  type = "pdf"

  async export(project: Project, options: ExportOptions): Promise<ExportResult> {
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: options.pageSize || "A4",
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margins = options.margins || { top: 20, bottom: 20, left: 20, right: 20 }
      const contentWidth = pageWidth - margins.left - margins.right

      let yPosition = margins.top
      let pageNumber = 1

      // Helper function to add page numbers
      const addPageNumber = () => {
        const pageNumText = pageNumber.toString()
        const textWidth = pdf.getTextWidth(pageNumText)

        let xPosition: number
        switch (options.pageNumberAlignment) {
          case "left":
            xPosition = margins.left
            break
          case "right":
            xPosition = pageWidth - margins.right - textWidth
            break
          default: // center
            xPosition = (pageWidth - textWidth) / 2
        }

        pdf.setFontSize(10)
        pdf.text(pageNumText, xPosition, pageHeight - 10)
      }

      // Helper function to check if new page is needed
      const checkNewPage = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - margins.bottom - 15) {
          addPageNumber()
          pdf.addPage()
          pageNumber++
          yPosition = margins.top
          return true
        }
        return false
      }

      // Add cover page if requested
      if (options.includeCover && project.coverImageId) {
        const coverImage = this.getImageById(project, project.coverImageId)
        if (coverImage) {
          try {
            pdf.addImage(coverImage.data, "JPEG", 0, 0, pageWidth, pageHeight)
            pdf.addPage()
            pageNumber++
            yPosition = margins.top
          } catch (error) {
            console.warn("Cover image could not be added:", error)
          }
        }
      }

      // Add title page
      pdf.setFontSize(24)
      pdf.setFont(undefined, "bold")
      const titleLines = pdf.splitTextToSize(project.name, contentWidth)
      pdf.text(titleLines, margins.left, yPosition)
      yPosition += titleLines.length * 12

      if (project.description) {
        yPosition += 10
        pdf.setFontSize(14)
        pdf.setFont(undefined, "normal")
        const descLines = pdf.splitTextToSize(project.description, contentWidth)
        pdf.text(descLines, margins.left, yPosition)
        yPosition += descLines.length * 8
      }

      // Add table of contents if requested
      if (options.includeTableOfContents) {
        checkNewPage(50)
        yPosition += 20
        pdf.setFontSize(18)
        pdf.setFont(undefined, "bold")
        pdf.text("İçindekiler", margins.left, yPosition)
        yPosition += 15

        pdf.setFontSize(12)
        pdf.setFont(undefined, "normal")

        for (const book of project.books) {
          checkNewPage(10)
          pdf.text(book.title, margins.left, yPosition)
          yPosition += 8

          for (const chapter of book.chapters) {
            checkNewPage(8)
            pdf.text(`  ${chapter.number || ""}. ${chapter.title}`, margins.left + 10, yPosition)
            yPosition += 6
          }
          yPosition += 5
        }
      }

      // Add books and chapters
      for (const book of project.books) {
        // Start book on new page
        if (options.chapterStartsOnRight && pageNumber % 2 === 0) {
          addPageNumber()
          pdf.addPage()
          pageNumber++
        }

        checkNewPage(30)
        yPosition += 20

        // Book title
        pdf.setFontSize(20)
        pdf.setFont(undefined, "bold")
        const bookTitleLines = pdf.splitTextToSize(book.title, contentWidth)
        pdf.text(bookTitleLines, margins.left, yPosition)
        yPosition += bookTitleLines.length * 10 + 15

        // Book description
        if (book.description) {
          pdf.setFontSize(12)
          pdf.setFont(undefined, "italic")
          const bookDescLines = pdf.splitTextToSize(book.description, contentWidth)
          pdf.text(bookDescLines, margins.left, yPosition)
          yPosition += bookDescLines.length * 6 + 10
        }

        // Chapters
        for (const chapter of book.chapters) {
          // Start chapter on new page if requested
          if (options.chapterStartsOnRight && pageNumber % 2 === 0) {
            addPageNumber()
            pdf.addPage()
            pageNumber++
            yPosition = margins.top
          } else {
            checkNewPage(40)
            yPosition += 15
          }

          // Chapter title
          pdf.setFontSize(16)
          pdf.setFont(undefined, "bold")
          const chapterTitle = `${chapter.number || ""}. ${chapter.title}`
          const chapterTitleLines = pdf.splitTextToSize(chapterTitle, contentWidth)
          pdf.text(chapterTitleLines, margins.left, yPosition)
          yPosition += chapterTitleLines.length * 8 + 10

          // Chapter content
          if (chapter.content) {
            pdf.setFontSize(options.fontSize || 11)
            pdf.setFont(undefined, "normal")

            const formattedContent = this.formatContent(chapter.content)
            const contentLines = pdf.splitTextToSize(formattedContent, contentWidth)

            for (const line of contentLines) {
              checkNewPage(6)
              pdf.text(line, margins.left, yPosition)
              yPosition += 6
            }
          }

          // Add chapter images if requested
          if (options.includeImages && chapter.imageIds) {
            for (const imageId of chapter.imageIds) {
              const image = this.getImageById(project, imageId)
              if (image) {
                checkNewPage(60)
                try {
                  const imgWidth = Math.min(contentWidth, 80)
                  const imgHeight = 60
                  pdf.addImage(image.data, "JPEG", margins.left, yPosition, imgWidth, imgHeight)
                  yPosition += imgHeight + 10
                } catch (error) {
                  console.warn("Chapter image could not be added:", error)
                }
              }
            }
          }
        }
      }

      // Add final page number
      addPageNumber()

      const pdfBlob = pdf.output("blob")

      return {
        success: true,
        data: pdfBlob,
        filename: this.generateFilename(project, "pdf"),
      }
    } catch (error) {
      console.error("PDF export error:", error)
      return {
        success: false,
        error: "PDF oluşturulurken hata oluştu",
      }
    }
  }
}
