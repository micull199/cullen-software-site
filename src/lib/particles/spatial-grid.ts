import type { Particle } from './types';

export class SpatialGrid {
	private cellSize: number;
	private cols: number;
	private rows: number;
	private cells: Particle[][];

	constructor(width: number, height: number, cellSize: number) {
		this.cellSize = cellSize;
		this.cols = Math.ceil(width / cellSize);
		this.rows = Math.ceil(height / cellSize);
		this.cells = new Array(this.cols * this.rows);
		this.clear();
	}

	resize(width: number, height: number) {
		this.cols = Math.ceil(width / this.cellSize);
		this.rows = Math.ceil(height / this.cellSize);
		this.cells = new Array(this.cols * this.rows);
		this.clear();
	}

	clear() {
		for (let i = 0; i < this.cells.length; i++) {
			this.cells[i] = [];
		}
	}

	private cellIndex(x: number, y: number): number {
		const col = Math.floor(x / this.cellSize);
		const row = Math.floor(y / this.cellSize);
		if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return -1;
		return row * this.cols + col;
	}

	insert(p: Particle) {
		const idx = this.cellIndex(p.x, p.y);
		if (idx >= 0) this.cells[idx].push(p);
	}

	queryRadius(x: number, y: number, radius: number): Particle[] {
		const results: Particle[] = [];
		const minCol = Math.max(0, Math.floor((x - radius) / this.cellSize));
		const maxCol = Math.min(this.cols - 1, Math.floor((x + radius) / this.cellSize));
		const minRow = Math.max(0, Math.floor((y - radius) / this.cellSize));
		const maxRow = Math.min(this.rows - 1, Math.floor((y + radius) / this.cellSize));
		const r2 = radius * radius;

		for (let row = minRow; row <= maxRow; row++) {
			for (let col = minCol; col <= maxCol; col++) {
				const cell = this.cells[row * this.cols + col];
				for (let i = 0; i < cell.length; i++) {
					const p = cell[i];
					const dx = p.x - x;
					const dy = p.y - y;
					if (dx * dx + dy * dy <= r2) {
						results.push(p);
					}
				}
			}
		}
		return results;
	}

	// Iterator for connection lines — yields unique pairs
	*neighborPairs(distance: number): Generator<[Particle, Particle, number]> {
		for (let row = 0; row < this.rows; row++) {
			for (let col = 0; col < this.cols; col++) {
				const idx = row * this.cols + col;
				const cell = this.cells[idx];

				// Check pairs within same cell
				for (let i = 0; i < cell.length; i++) {
					for (let j = i + 1; j < cell.length; j++) {
						const dx = cell[i].x - cell[j].x;
						const dy = cell[i].y - cell[j].y;
						const dist = Math.sqrt(dx * dx + dy * dy);
						if (dist <= distance) {
							yield [cell[i], cell[j], dist];
						}
					}
				}

				// Check adjacent cells (right, bottom-left, bottom, bottom-right)
				const neighbors = [
					col + 1 < this.cols ? idx + 1 : -1,
					row + 1 < this.rows && col > 0 ? (row + 1) * this.cols + col - 1 : -1,
					row + 1 < this.rows ? (row + 1) * this.cols + col : -1,
					row + 1 < this.rows && col + 1 < this.cols ? (row + 1) * this.cols + col + 1 : -1,
				];

				for (const nIdx of neighbors) {
					if (nIdx < 0) continue;
					const neighbor = this.cells[nIdx];
					for (let i = 0; i < cell.length; i++) {
						for (let j = 0; j < neighbor.length; j++) {
							const dx = cell[i].x - neighbor[j].x;
							const dy = cell[i].y - neighbor[j].y;
							const dist = Math.sqrt(dx * dx + dy * dy);
							if (dist <= distance) {
								yield [cell[i], neighbor[j], dist];
							}
						}
					}
				}
			}
		}
	}
}
