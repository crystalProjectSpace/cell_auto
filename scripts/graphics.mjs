'use strict'

const DEFAULT_FORMATS = ['png', 'bmp', 'jpg', 'gif']

export class Graphics {
    #ctx = null
    #width = 0
    #height = 0
    #format = 'png'

    constructor(canvas, saver, width, height, format) {
        this.#ctx = canvas.getContext('2d')
        this.#width = width
        this.#height = height
        this.#format = DEFAULT_FORMATS.includes(format) ? format : this.#format 

        if (saver) saver.addEventListener('pointerup', () => this.#save())
    }

    reset() {
        this.#ctx.canvas.width = this.#width
        this.#ctx.canvas.height = this.#height
    }

    drawBuffer(buffer) {
        this.reset()
        const rawImg = new ImageData(buffer, this.#width)
        this.#ctx.putImageData(rawImg, 0, 0)
    }

    #save(format) {
        const canvasData = this.#ctx.canvas.toDataURL(`image/${this.#format}`)
        const a = document.createElement('a')
        a.download = `cell_gen_${Date.now()}.${this.#format}`
        a.href = canvasData
        a.click()
    }
}
