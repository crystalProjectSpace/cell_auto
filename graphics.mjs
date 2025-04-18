'use strict'

export class Graphics {
    #ctx = null
    #width = 0
    #height = 0

    constructor(canvas, saver, width, height) {
        this.#ctx = canvas.getContext('2d')
        this.#width = width
        this.#height = height

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
        const canvasData = this.#ctx.canvas.toDataURL(`image/${format}`)
        const a = document.createElement('a')
        a.download = `cell_gen_${Date.now()}.${format}`
        a.href = canvasData
        a.click()
    }
}
