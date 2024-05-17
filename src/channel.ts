export type ChannelType = 'Input' | 'Group' | 'Aux' | 'Matrix' | 'FxSend' | 'FxReturn' | 'Main' | 'DCA' | 'MuteGroup'

export function toChannel(ch: ChannelType): Channel {
	const value = {
		input: { id: 'input', label: 'Input', count: 128 },
		group: {
			id: 'group',
			label: 'Group',
			count: 62,
			stereo: 31,
		},
		aux: {
			id: 'aux',
			label: 'Aux',
			count: 62,
			stereo: 31,
		},
		matrix: {
			id: 'matrix',
			label: 'Matrix',
			count: 62,
			stereo: 31,
		},
		fxsend: {
			id: 'fxSend',
			label: 'FX Send',
			count: 16,
			stereo: 16,
		},
		fxreturn: { id: 'fxReturn', label: 'FX Return', count: 16 },
		main: { id: 'main', label: 'Main', count: 6 },
		dca: { id: 'dca', label: 'DCA', count: 24 },
		mutegroup: { id: 'muteGroup', label: 'Mute Group', count: 8 },
	}[ch.toLowerCase()]
	if (!value) throw new Error('ChannelType not supported')
	return value
}

export interface Channel {
	id: string
	label: string
	count: number
	stereo?: number
}
