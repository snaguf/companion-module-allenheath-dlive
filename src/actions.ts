import { CompanionOptionValues, SomeCompanionActionInputField } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { ChannelType, toChannel } from './channel.js'

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		muteChannel: {
			name: 'Channel Mute',
			description: 'Mute / Unmute Channel, Mix, DCA or Mute Group',
			options: [
				...channelOptions(['Input', 'Group', 'Aux', 'Matrix', 'Main', 'FxSend', 'FxReturn', 'DCA', 'MuteGroup']),
				{
					id: 'muteValue',
					type: 'dropdown',
					label: 'On / Off',
					choices: [
						{ id: 0x7f, label: 'On' },
						{ id: 0x3f, label: 'Off' },
					],
					default: 0x7f,
				},
			],
			callback: async (event) => {
				self.log('warn', `${event.options.channelType}`)
				const { n, ch } = parseChannel(event.options)
				const midiChannel = 0x90 + n + self.config.midiChannel
				const muteValue = event.options.muteValue as number
				const buffer = Buffer.from([midiChannel, ch, muteValue, ch, 0x00])
				await self.connection.send(buffer)
			},
		},
		faderLevel: {
			name: 'Channel Fader',
			description: 'Set Channel, Mix or DCA fader to value',
			options: [
				...channelOptions(['Input', 'Group', 'Aux', 'Matrix', 'Main', 'FxSend', 'FxReturn', 'DCA', 'MuteGroup']),
			],
			callback: async (event) => {
				// TODO: Fader level action
				self.log('info', `${event.actionId}: Not yet implemented`)
			},
		},
		sceneRecall: {
			name: 'Scene Recall',
			description: 'Recall spesific scene',
			options: [{ id: 'sceneNumber', type: 'number', label: 'Scene', default: 1, min: 1, max: 500 }],
			callback: async (event) => {
				// TODO: Scene recall action
				self.log('info', `${event.actionId}: Not yet implemented`)
			},
		},
		virtualSoundcheck: {
			name: 'Virtual Soundcheck',
			description: 'Toggle Virtual Soundcheck modes',
			options: [
				{
					id: 'vscMode',
					type: 'dropdown',
					label: 'VSC Mode',
					choices: [
						{ id: 'inactive', label: 'Inactive' },
						{ id: 'record', label: 'Record Send' },
						{ id: 'vsc', label: 'Virtual Soundcheck' },
					],
					default: 'inactive',
				},
			],
			callback: async (event) => {
				// TODO: Virtual Soundcheck action
				self.log('info', `${event.actionId}: Not yet implemented`)
			},
		},
		talkback: {
			name: 'Talkback',
			description: 'On / Off Talkback button',
			options: [
				{
					id: 'tbMode',
					type: 'dropdown',
					label: 'On / Off',
					choices: [
						{ id: 'tbOn', label: 'On' },
						{ id: 'tbOff', label: 'Off' },
					],
					default: 'tbOn',
				},
			],
			callback: async (event) => {
				// TODO: Talkback action
				self.log('info', `${event.actionId}: Not yet implemented`)
			},
		},
		dcaAssignment: {
			name: 'DCA Assignment',
			description: 'Assign Channel or Mix to DCA',
			options: [
				...channelOption('DCA', true),
				...channelOptions(['Input', 'Group', 'Aux', 'Matrix', 'Main', 'FxSend', 'FxReturn']),
				{
					id: 'dcaAssign',
					type: 'dropdown',
					label: 'On / Off',
					choices: [
						{ id: 'dcaOn', label: 'On' },
						{ id: 'dcaOff', label: 'Off' },
					],
					default: 'dcaOn',
				},
			],
			callback: async (event) => {
				// TODO: DCA Assignment action
				self.log('info', `${event.actionId}: Not yet implemented`)
			},
		},
		mainAssignment: {
			name: 'Main Mix Assignment',
			description: 'Assign Channel, Group or FX Return to Main Mix',
			options: [
				...channelOptions(['Input', 'Group', 'FxReturn']),
				{
					id: 'mainAssign',
					type: 'dropdown',
					label: 'On / Off',
					choices: [
						{ id: 'mainOn', label: 'On' },
						{ id: 'mainOff', label: 'Off' },
					],
					default: 'mainOn',
				},
			],
			callback: async (event) => {
				// TODO: Main Assignment action
				self.log('info', `${event.actionId}: Not yet implemented`)
			},
		},
		muteGroupAssignment: {
			name: 'Mute Group Assignment',
			description: 'Assign Channel or Mix to Mute Group',
			options: [
				...channelOption('MuteGroup', true),
				...channelOptions(['Input', 'Group', 'Aux', 'Matrix', 'Main', 'FxSend', 'FxReturn']),
				{
					id: 'muteGroupAssign',
					type: 'dropdown',
					label: 'On / Off',
					choices: [
						{ id: 'muteGroupOn', label: 'On' },
						{ id: 'muteGroupOff', label: 'Off' },
					],
					default: 'muteGroupOn',
				},
			],
			callback: async (event) => {
				// TODO: Mute Group Assingment action
				self.log('info', `${event.actionId}: Not yet implemented`)
			},
		},
	})
}

function stereoOption(): SomeCompanionActionInputField {
	return {
		id: 'channelStereo',
		type: 'dropdown',
		label: 'Mono / Stereo',
		choices: [
			{ id: 'mono', label: 'Mono' },
			{ id: 'stereo', label: 'Stereo' },
		],
		default: 'mono',
		isVisible: (options) => {
			return (
				options.channelType === 'group' ||
				options.channelType === 'aux' ||
				options.channelType === 'matrix' ||
				options.channelType === 'fxSend'
			)
		},
	}
}

function channelOption(channelType: ChannelType, visibility?: boolean): Array<SomeCompanionActionInputField> {
	const channel = toChannel(channelType)
	const channelOptions: Array<SomeCompanionActionInputField> = [
		{
			id: `${channel.id}Option`,
			type: 'dropdown',
			label: channel.label,
			choices: range(channel.count, (i) => {
				const value = i + 1
				return { id: i, label: `${channel.label} ${value}` }
			}),
			default: 0,
			isVisibleData: { id: channel.id, stereo: channel.stereo },
			isVisible: visibility
				? (options, data) => {
						if (data.stereo) {
							return options.channelStereo === 'mono'
						}
						return true
				  }
				: (options, data) => {
						return options.channelType === data.id && options.channelStereo === 'mono'
				  },
		},
	]

	if (channel.stereo) {
		channelOptions.push({
			id: `${channel.id}StereoOption`,
			type: 'dropdown',
			label: channel.label,
			choices: range(channel.stereo, (i) => {
				const value = i + 1
				return { id: i, label: `${channel.label} ${value}` }
			}),
			default: 0,
			isVisibleData: { id: channel.id, stero: channel.stereo },
			isVisible: visibility
				? (options) => {
						return true && options.channelStereo === 'stereo'
				  }
				: (options, data) => {
						return options.channelType === data.id && options.channelStereo === 'stereo'
				  },
		})
	}
	return channelOptions
}

function channelOptions(channels: Array<ChannelType>): Array<SomeCompanionActionInputField> {
	return [
		{
			id: 'channelType',
			type: 'dropdown',
			label: 'Channel type',
			choices: channels.flatMap((ch) => {
				const channel = toChannel(ch)
				return { id: channel.id, label: channel.label }
			}),
			default: toChannel(channels[0]).id,
		},
		stereoOption(),
		...channels.flatMap((channel) => channelOption(channel)),
	]
}

function range<T>(count: number, fn: (i: number) => T): Array<T> {
	return Array.from({ length: count }, (_, key) => {
		return fn(key)
	})
}
function parseChannel(options: CompanionOptionValues): { n: number; ch: number } {
	const stereo = options.channelStereo === 'stereo'
	switch (options.channelType) {
		case 'input': {
			return { n: 0, ch: options.inputOption as number }
		}
		case 'group': {
			const group = stereo ? (options.groupStereoOption as number) : (options.groupOption as number)
			return { n: 1, ch: stereo ? group + 0x40 : group }
		}

		case 'aux': {
			const aux = stereo ? (options.auxStereoOption as number) : (options.auxOption as number)
			return { n: 2, ch: stereo ? aux + 0x40 : aux }
		}
		case 'matrix': {
			const matrix = stereo ? (options.matrixStereoOption as number) : (options.matrixOption as number)
			return { n: 3, ch: stereo ? matrix + 0x40 : matrix }
		}
		case 'fxSend': {
			const fxSend = stereo ? (options.fxSendStereoOption as number) : (options.fxSendOption as number)
			return { n: 4, ch: stereo ? fxSend + 0x10 : fxSend }
		}
		case 'fxReturn': {
			const fxReturn = options.fxReturnOption as number
			return { n: 4, ch: fxReturn + 0x20 }
		}
		case 'main': {
			const main = options.mainOption as number
			return { n: 4, ch: main + 0x30 }
		}
		case 'dca': {
			const dca = options.dcaOption as number
			return { n: 4, ch: dca + 0x36 }
		}
		case 'muteGroup': {
			const muteGroup = options.muteGroupOption as number
			return { n: 4, ch: muteGroup + 0x4e }
		}
		default:
			throw new Error('Unsupported channel type')
	}
}
