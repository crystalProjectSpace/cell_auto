import { CellModel } from "./cell_model.mjs"

const cellModel = new CellModel()

onmessage = function(evt) {
	const { type, payload } = evt.data
	
	switch(type) {
		case 'init': {
			const initData = JSON.parse(payload)
			const {
				width,
				height,
				probability,
				colorMap
			} = initData
			
			cellModel.init(width, height)
			cellModel.randomSeed(probability)
			cellModel.setColorMap(colorMap)
			postMessage({ type: 'init', payload: true })
			break
		}
		case 'run': {
			const progressCB = (payload) => { postMessage({ type: 'progress', payload }) }
			const time = cellModel.run(payload, progressCB, 200)
			postMessage({ type: 'run', payload: time })
			break
		}
		case 'graph': {
			const graphics = cellModel.getVisualization()
			postMessage({ type: 'graph', payload: graphics })
			break
		}
	}
}
