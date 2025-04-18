export class CellModel {
	#width = 0
	#height = 0
	#count = 0
	#cellCount = 0
	#grid = null
	#cells = null
	#colorMap = []
	#state = [0, 0, 0]
	/**
	* @description Инициировать модельное пространство заданными координатами
	*/
	init(width, height) {
		this.#width = width
		this.#height = height
		this.#cellCount = this.#width * this.#height
		this.#count = this.#cellCount << 1		
		this.#grid = new ArrayBuffer(this.#count)
		this.#cells = new Uint16Array(this.#grid)
	}
	/**
	* @description Заполнить модельное пространство с зададнной плотностью
	*/
	randomSeed(prob) {
		for (let i = 0; i < this.#cellCount; i++) {
			this.#cells[i] = 1 - Math.random() > prob ? 1 : 0
		}
	}
	/**
	* @description Получить состояние вокруг текущего элемента
	*/
	#getActiveSumm(x, y) {
		let y0 = y - 1
		y0 = y0 < 0 ? this.#height + y0 : y0
		let y1 = y + 1
		y1 = y1 < this.#height ? y1 : y1 - this.#height
		let x0 = x - 1
		x0 = x0 < 0 ? this.#width + x0 : x0
		let x1 = x + 1
		x1 = x1 < this.#width ? x1 : x1 - this.#width
		
		const w0 = this.#width * y0
		const w = this.#width * y
		const w1 = this.#width * y1
		
		const NW = this.#cells[w0 + x0] & 255
		const N = this.#cells[w0 + x] & 255
		const NE = this.#cells[w0 + x1] & 255
		const W = this.#cells[w + x0] & 255
		const C = this.#cells[w + x] & 255
		const E = this.#cells[w + x1] & 255
		const SW = this.#cells[w1 + x0] & 255
		const S = this.#cells[w1 + x] & 255
		const SE = this.#cells[w1 + x1] & 255
		
		this.#state[0] = C
		this.#state[1] = NW + N + NE + W + C + E + SW + S + SE
		this.#state[2] = NW + W + SW
	}
	/**
	* @description получить состояние колонки справа от текущего блока
	*/
	#nextCellSumm(x, y) {
		let y0 = y - 1
		y0 = y0 < 0 ? this.#height + y0 : y0
		let y1 = y + 1
		y1 = y1 < this.#height ? y1 : y1 - this.#height
		let x0 = x - 1
		x0 = x0 < 0  ? this.#width + x0 : x0
		let x1 = x + 1
		x1 = x1 < this.#width ? x1 : x1 - this.#width
		
		const w0 = this.#width * y0
		const w = this.#width * y
		const w1 = this.#width * y1
		
		
		const NW = this.#cells[w0 + x0] & 255
		const W = this.#cells[w + x0] & 255
		const SW = this.#cells[w1 + x0] & 255
	
		const C = this.#cells[w + x] & 255
		
		const NE = this.#cells[w0 + x1] & 255
		const E = this.#cells[w + x1] & 255		
		const SE = this.#cells[w1 + x1] & 255
		
		this.#state[0] = C
		this.#state[1] += (NE + E + SE - this.#state[2])
		this.#state[2] = NW + W + SW
	}
	/**
	* @description Провести итерацию по всем клеткам с получением состояния на новом этапе
	*/
	#iterate() {
		let x = 0
		let y = 0
		for (let i = 0; i < this.#cellCount; i++) {
			x > 0 ? this.#nextCellSumm(x, y) : this.#getActiveSumm(x, y)

			this.#cells[i] |= this.#transit()
			if (++x === this.#width) {
				x = 0
				y++
			}
		}
	}
	/**
	* @description Отобразить визуал и перевести состояние на следующий этап времени
	*/
	#nextStep() {
		for (let i = 0; i < this.#cellCount; i++) {
			this.#cells[i] >>= 8
		}
	}
	
	getVisualization() {
		const visual = new Uint8ClampedArray(this.#count << 1)
		let visualCounter = 0
		for (let i = 0; i < this.#cellCount; i++) {
			const state = this.#cells[i] & 255
			if (state === 0) {
				visualCounter += 4
				continue
			}
			const rawColor = this.#colorMap[state]
			visual[visualCounter++] = rawColor.R
			visual[visualCounter++] = rawColor.G
			visual[visualCounter++] = rawColor.B
			visual[visualCounter++] = rawColor.A
		}
		
		return visual
	}
	
	/**
	* @description базовое GoL-правило
	*/
	#transit() {
		if (this.#state[0] === 0) return this.#state[1] === 3 ? 256 : 0
		switch (this.#state[1]) {
			case 3:
			case 4: return 256
			default: return 0
		}
	}
	
	setColorMap(clMap) {
		this.#colorMap = clMap.slice()
	}
	
	run(nStep, cb, range) {
		const t0 = performance.now()
		for (let i = 0; i < nStep; i++) {
			this.#iterate()
			this.#nextStep()
            if (cb && i % range === 0) cb(i)
		}
        cb && cb(nStep)
		return performance.now() - t0
	}
}
