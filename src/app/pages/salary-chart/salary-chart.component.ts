import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

interface SalaryData {
  position: string;
  data: { experience: number; salary: number }[];
}

@Component({
  selector: 'app-salary-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './salary-chart.component.html',
  styleUrls: ['./salary-chart.component.scss']
})
export class SalaryChartComponent implements OnInit {
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Mức Lương Theo Năm Kinh Nghiệm - Ngành CNTT',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toLocaleString('vi-VN') + ' VNĐ';
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function (value) {
            return (Number(value) / 1000000).toFixed(0) + 'M';
          }
        },
        title: {
          display: true,
          text: 'Mức lương (triệu VNĐ)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Năm kinh nghiệm'
        }
      }
    }
  };

  public lineChartLegend = true;

  ngOnInit() {
    this.loadSalaryData();
  }

  /**
   * Load salary data for different IT positions
   * Data is based on typical salary ranges in Vietnam IT market
   */
  private loadSalaryData(): void {
    const salaryData: SalaryData[] = [
      {
        position: 'Frontend Developer',
        data: [
          { experience: 0, salary: 8000000 },
          { experience: 1, salary: 12000000 },
          { experience: 2, salary: 18000000 },
          { experience: 3, salary: 25000000 },
          { experience: 4, salary: 30000000 },
          { experience: 5, salary: 35000000 },
          { experience: 7, salary: 45000000 },
          { experience: 10, salary: 60000000 }
        ]
      },
      {
        position: 'Backend Developer',
        data: [
          { experience: 0, salary: 9000000 },
          { experience: 1, salary: 13000000 },
          { experience: 2, salary: 20000000 },
          { experience: 3, salary: 27000000 },
          { experience: 4, salary: 33000000 },
          { experience: 5, salary: 38000000 },
          { experience: 7, salary: 50000000 },
          { experience: 10, salary: 70000000 }
        ]
      },
      {
        position: 'Full Stack Developer',
        data: [
          { experience: 0, salary: 10000000 },
          { experience: 1, salary: 15000000 },
          { experience: 2, salary: 22000000 },
          { experience: 3, salary: 30000000 },
          { experience: 4, salary: 37000000 },
          { experience: 5, salary: 43000000 },
          { experience: 7, salary: 55000000 },
          { experience: 10, salary: 80000000 }
        ]
      },
      {
        position: 'DevOps Engineer',
        data: [
          { experience: 0, salary: 11000000 },
          { experience: 1, salary: 16000000 },
          { experience: 2, salary: 24000000 },
          { experience: 3, salary: 32000000 },
          { experience: 4, salary: 40000000 },
          { experience: 5, salary: 48000000 },
          { experience: 7, salary: 60000000 },
          { experience: 10, salary: 85000000 }
        ]
      },
      {
        position: 'Mobile Developer',
        data: [
          { experience: 0, salary: 9000000 },
          { experience: 1, salary: 14000000 },
          { experience: 2, salary: 20000000 },
          { experience: 3, salary: 28000000 },
          { experience: 4, salary: 35000000 },
          { experience: 5, salary: 40000000 },
          { experience: 7, salary: 52000000 },
          { experience: 10, salary: 75000000 }
        ]
      },
      {
        position: 'Data Engineer',
        data: [
          { experience: 0, salary: 12000000 },
          { experience: 1, salary: 18000000 },
          { experience: 2, salary: 26000000 },
          { experience: 3, salary: 35000000 },
          { experience: 4, salary: 45000000 },
          { experience: 5, salary: 55000000 },
          { experience: 7, salary: 70000000 },
          { experience: 10, salary: 95000000 }
        ]
      }
    ];

    // Extract unique experience years for x-axis
    const experienceYears = Array.from(
      new Set(salaryData.flatMap(pos => pos.data.map(d => d.experience)))
    ).sort((a, b) => a - b);

    // Create datasets for each position
    const datasets = salaryData.map((position, index) => {
      const colors = [
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 206, 86)',
        'rgb(75, 192, 192)',
        'rgb(153, 102, 255)',
        'rgb(255, 159, 64)'
      ];

      return {
        data: experienceYears.map(year => {
          const dataPoint = position.data.find(d => d.experience === year);
          return dataPoint ? dataPoint.salary : null;
        }) as number[],
        label: position.position,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length].replace('rgb', 'rgba').replace(')', ', 0.1)'),
        tension: 0.4,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6
      };
    });

    this.lineChartData = {
      labels: experienceYears.map(year => year + ' năm'),
      datasets: datasets
    };
  }
}
