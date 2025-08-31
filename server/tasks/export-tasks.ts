'use server';

import { prisma } from '@/prisma/db';
import ExcelJS from 'exceljs';
import { paperTypeConvert, taskStatusConvert } from '@/lib/utils';

type ExportTasksParams = {
  startDate?: Date;
  endDate?: Date;
  month?: number;
  year?: number;
};

export async function exportTasksToXLSX({
  startDate,
  endDate,
  month,
  year,
}: ExportTasksParams) {
  try {
    // Build date filter condition based on duration (delivery date)
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        duration: {
          gte: startDate,
          lte: endDate,
        },
      };
    } else if (month && year) {
      const firstDayOfMonth = new Date(year, month - 1, 1);
      const lastDayOfMonth = new Date(year, month, 0);
      dateFilter = {
        duration: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      };
    }

    // Fetch tasks with related data
    const tasks = await prisma.task.findMany({
      where: {
        ...dateFilter,
        isDeleted: false, // Only include non-deleted tasks
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        link: true,
        note: true,
        amount: true,
        startDate: true,
        duration: true,
        paper_type: true,
        taskAssignments: {
          where: {
            status: 'ACTIVE',
          },
          select: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        client: {
          select: {
            name: true,
          },
        },
        payments: {
          where: {
            status: 'COMPLETED',
          },
          select: {
            amount: true,
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
      { width: 8 }, // Serial
      { width: 30 }, // Title
      { width: 40 }, // Description
      { width: 15 }, // Status
      { width: 30 }, // Link
      { width: 30 }, // Note
      { width: 12 }, // Total Amount
      { width: 12 }, // Paid Amount
      { width: 12 }, // Due Amount
      { width: 15 }, // Assign Date
      { width: 15 }, // Delivery Date
      { width: 15 }, // Paper Type
      { width: 40 }, // Assigned Users
      { width: 30 }, // Client
    ];

    // Add headers
    const headers = [
      'Serial',
      'Title',
      'Description',
      'Status',
      'Link',
      'Note',
      'Total Amount',
      'Paid Amount',
      'Due Amount',
      'Assign Date',
      'Delivery Date',
      'Paper Type',
      'Assigned Users',
      'Client',
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

    // Add data rows
    tasks.forEach((task, index) => {
      const assignedUsersStr = task.taskAssignments
        .map(
          (assignment) => `${assignment.user.name} (${assignment.user.email})`
        )
        .join(', ');

      const startDate = task.startDate
        ? new Date(task.startDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        : '';
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

      worksheet.addRow([
        index + 1,
        task.title || '',
        task.description || '',
        taskStatusConvert[task.status as keyof typeof taskStatusConvert] || '',
        task.link || '',
        task.note || '',
        totalAmount.toFixed(2),
        paidAmount.toFixed(2),
        dueAmount.toFixed(2),
        startDate,
        endDate,
        paperTypeConvert[task.paper_type as keyof typeof paperTypeConvert] ||
          '',
        assignedUsersStr,
        task.client?.name || 'N/A',
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
            : ('left' as const), // Financial columns are right-aligned
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
