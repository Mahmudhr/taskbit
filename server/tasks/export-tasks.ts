'use server';

import { prisma } from '@/prisma/db';
import ExcelJS from 'exceljs';
import { paperTypeConvert } from '@/lib/utils';

type ExportTasksParams = {
  startDate?: Date;
  endDate?: Date;
  month?: number;
  year?: number;
  clientId?: string;
  paymentStatus?: 'paid' | 'due' | 'all';
};

export async function exportTasksToXLSX({
  startDate,
  endDate,
  month,
  year,
  clientId,
  paymentStatus,
}: ExportTasksParams) {
  try {
    // Build filter conditions
    const filters: Record<string, unknown> = {
      isDeleted: false, // Only include non-deleted tasks
    };

    // Add client filter if provided
    if (clientId) {
      filters.clientId = clientId;
    }

    // Add date filter condition based on duration (delivery date)
    if (startDate && endDate) {
      filters.duration = {
        gte: startDate,
        lte: endDate,
      };
    } else if (month && year) {
      const firstDayOfMonth = new Date(year, month - 1, 1);
      const lastDayOfMonth = new Date(year, month, 0);
      filters.duration = {
        gte: firstDayOfMonth,
        lte: lastDayOfMonth,
      };
    }

    // Fetch tasks with related data
    const tasks = await prisma.task.findMany({
      where: filters,
      select: {
        id: true,
        title: true,
        duration: true,
        paper_type: true,
        amount: true,
        payments: {
          where: { status: 'COMPLETED' },
          select: { amount: true },
        },
        client: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Create workbook and add worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tasks');

    // Set column widths
    worksheet.columns = [
      { width: 65 }, // Title
      { width: 15 }, // Delivery Date
      { width: 15 }, // Paper Type
      { width: 30 }, // Client
      { width: 16 }, // Paper Type
      { width: 16 }, // Paper Type
      { width: 16 }, // Paper Type
    ];

    // Add headers
    const headers = [
      'Title',
      'Delivery Date',
      'Paper Type',
      'Client',
      'Total Amount',
      'Paid Amount',
      'Due Amount',
    ];
    worksheet.addRow(headers);

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'E0E6F3' },
    };

    // Add data rows with paid/due calculation and filtering
    tasks
      .map((task) => {
        const endDate = task.duration
          ? new Date(task.duration).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          : '';
        const totalAmount = task.amount ? Number(task.amount) : 0;
        const paidAmount = task.payments.reduce(
          (sum, payment) => sum + (payment.amount || 0),
          0
        );
        const dueAmount = totalAmount - paidAmount;
        return {
          ...task,
          endDate,
          totalAmount,
          paidAmount,
          dueAmount,
        };
      })
      .filter((task) => {
        if (paymentStatus === 'paid') return task.dueAmount === 0;
        if (paymentStatus === 'due') return task.dueAmount > 0;
        return true;
      })
      .forEach((task) => {
        const totalAmount = task.amount ? Number(task.amount) : 0;
        const paidAmount = task.payments.reduce(
          (sum, payment) => sum + (payment.amount || 0),
          0
        );
        const dueAmount = totalAmount - paidAmount;
        worksheet.addRow([
          task.title || '',
          task.endDate,
          paperTypeConvert[task.paper_type as keyof typeof paperTypeConvert] ||
            '',
          task.client?.name || 'N/A',
          totalAmount.toFixed(2),
          paidAmount.toFixed(2),
          dueAmount.toFixed(2),
        ]);
      });

    // Apply styles to all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        // Skip header row as it's already styled
        if (rowNumber > 1) {
          cell.font = { name: 'Calibri', size: 11 };
        }

        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          right: { style: 'thin', color: { argb: 'FFD3D3D3' } },
        };
      });
    });

    // Set fixed alignments for better compatibility
    worksheet.columns.forEach((column, columnIndex) => {
      const alignment: Partial<ExcelJS.Alignment> = {
        vertical: 'middle' as const,
        horizontal:
          columnIndex >= 6 && columnIndex <= 8
            ? ('right' as const)
            : ('left' as const),
      };

      // Apply the alignment to all cells in the column
      worksheet.getColumn(columnIndex + 1).eachCell((cell) => {
        cell.alignment = alignment;
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    console.error('Error exporting tasks:', error);
    throw new Error('Failed to export tasks');
  }
}
