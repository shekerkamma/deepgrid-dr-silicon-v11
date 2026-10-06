# Native-diagram specs for the parts whose draw.io diagrams were drawn by hand rather than generated:
# DG32-LITE, DG32-2DOM (from public/downloads/dg32-*-architecture.drawio) and D100 (from
# public/downloads/d100-architecture.drawio). Same schema as specs.py, but these only feed the native
# diagram data; their .drawio, SVG, guide and notes are maintained separately.
# Blocks: (key, title, subtitle[, span]). `marks` puts numbered markers on blocks explicitly.

NATIVE = [
 {'id': 'lite', 'code': 'DG32-LITE',
  'frame': 'DG32-LITE  ·  one 50 MHz clock domain  ·  130 nm CMOS  ·  QFN-64',
  'output': 'Off-chip: QSPI NOR flash · gate driver + 3-phase bridge · motor sensors · host, sensors, test',
  'marks': {'PWM': ['①', '⑤'], 'ADC': ['②'], 'CORDIC': ['③'], 'MAIN': ['④'], 'LATCH': ['F']},
  'edges': [('PWM', 'ADC', '①', 'sample trigger at the period centre'), ('ADC', 'CORDIC', '②', 'phase current'), ('ENC', 'CORDIC', '', 'rotor angle'), ('CORDIC', 'MAIN', '③', 'Clarke / Park transforms'), ('MAIN', 'PWM', '④', 'PI output to duty registers'), ('PWM', 'OUT', '⑤', 'gate signals'),
            ('MAIN', 'CMP', '', 'committed stores'), ('CHK', 'CMP', '', 'same stores, 2 cycles later'), ('CMP', 'LATCH', '', 'mismatch'), ('LATCH', 'OUT', 'F', 'FAULT_N trips the bridge'), ('ROM', 'SRAM', '', 'application image'), ('QSPI', 'ROM', '', 'flash image at boot')],
  'rows': [
   {'zones': [
     {'key': 'S', 'name': 'Safety core', 'tone': 'safe', 'cols': 2, 'w': 1.2,
      'blocks': [('MAIN', 'MAIN core', 'RV32IM · application'), ('CHK', 'CHECKER core', 'same inputs, 2 cycles behind'), ('CMP', 'Lockstep comparator', 'every committed store'), ('LATCH', 'Fault latch', 'first cause · FAULT_N')]},
     {'key': 'M', 'name': 'Memory and boot', 'cols': 2, 'w': 1.2,
      'blocks': [('ROM', 'Boot ROM 64 KB', 'validates image, copies to SRAM'), ('SRAM', 'SRAM 32 KB', 'dual-port: data + fetch'), ('QSPI', 'QSPI controller', 'boot flash + PSRAM window'), ('DMA', 'DMA', 'second bus master')]},
     {'key': 'SV', 'name': 'Supervision', 'cols': 1, 'w': 0.8,
      'blocks': [('WDT', 'Windowed watchdog', '+ supply supervisor'), ('IRQ', 'Interrupt controller', '16 sources, both cores')]},
   ]},
   {'bus': 'On-chip bus  ·  two masters (CPU, DMA)  ·  deterministic latency  ·  unmapped address → bus error, never a hang'},
   {'zones': [
     {'key': 'MD', 'name': 'Motor drive', 'cols': 2, 'w': 1,
      'blocks': [('PWM', '3-phase PWM', 'dead-time · hardware brake', 2), ('DSHOT', 'DShot × 4', ''), ('TMR', 'Timers × 2', ''), ('SYS', 'System control', 'clock gates · pin mux', 2)]},
     {'key': 'SN', 'name': 'Sensing and math', 'cols': 2, 'w': 1,
      'blocks': [('ADC', 'SAR ADC 8-bit', 'differential · ~200 kSa/s', 2), ('ENC', 'Encoder + Hall', 'edge timestamps'), ('CORDIC', 'CORDIC', 'sin · cos · atan2')]},
     {'key': 'CT', 'name': 'Connectivity and test', 'cols': 2, 'w': 1,
      'blocks': [('UART', 'UART × 2', ''), ('SPI', 'SPI', 'to 25 MHz'), ('I2C', 'I²C', '100/400 kHz'), ('GPIO', 'GPIO', 'atomic set/clear'), ('JTAG', 'JTAG + scan chains', 'production test', 2)]},
   ]},
  ]},

 {'id': '2dom', 'code': 'DG32-2DOM',
  'frame': 'DG32-2DOM  ·  3.4 × 4.5 mm die  ·  two clock domains  ·  same QFN-64 pinout as DG32-LITE',
  'marks': {'CPU': ['①'], 'LITEB': ['①'], 'RD': ['②'], 'WR': ['③'], 'IRQ': ['④']},
  'edges': [('CPU', 'LITEB', '①', 'job shapes over AXI-lite'), ('LITEB', 'P1', '', 'programmed geometry'), ('MEM', 'RD', '②', 'keys and values, once per kick'), ('RD', 'K', '', 'keys'), ('RD', 'V', '', 'values'), ('P1', 'P2', '', ''), ('P2', 'P3', '', 'scores'), ('P3', 'P4', '', '15-bit weights'), ('P4', 'P5', '', '40-bit sums'), ('P5', 'P6', '', 'INT8 row'), ('P6', 'WR', '③', 'INT8 output'), ('WR', 'MEM', '', 'written back'), ('P6', 'IRQ', '④', 'done interrupt'), ('IRQ', 'CPU', '', 'to both cores'), ('EXP', 'P3', '', 'softmax weights'), ('DMA', 'RD', '', 'idle SRAM read port')],
  'rows': [
   {'zones': [
     {'key': 'C', 'name': '50 MHz control domain · identical to DG32-LITE', 'cols': 2, 'w': 1.3,
      'note': 'Control loop unchanged: ~300 hardware cycles per loop, ~100 kHz simulated ceiling. The engine cannot extend the core’s worst-case execution time.',
      'blocks': [('CPU', 'Lockstep CPU pair', 'MAIN + CHECKER, RV32IM'), ('FL', 'Fault latch + supervision', 'FAULT_N · watchdog · supplies'), ('MEM', 'Boot ROM + SRAM', '64 KB · 32 KB dual-port'), ('DMA', 'DMA', 'can feed the engine from the idle SRAM read port'),
                 ('IRQ', 'Interrupt controller', '16 sources, engine done included'), ('QSPI', 'QSPI controller', 'boot from external flash'), ('BUS', 'On-chip bus', 'bus error, never a hang', 2),
                 ('MOT', 'Motor drive + sensing', 'PWM · DShot · encoder · ADC · CORDIC'), ('IO', 'Connectivity + test', 'UART · SPI · I²C · GPIO · JTAG')]},
     {'key': 'B', 'name': 'Clock-domain bridges', 'cols': 1, 'w': 0.7,
      'note': '4-phase request / acknowledge through 2-flop synchronisers.',
      'blocks': [('LITEB', 'Lite bridge', 'programming, one transaction'), ('RD', 'Burst read', 'whole burst, one crossing'), ('WR', 'Burst write', 'whole burst, one crossing')]},
     {'key': 'E', 'name': '114 MHz compute domain · INT8 attention engine', 'cols': 2, 'w': 1.3,
      'note': 'Bit-exact to the golden model · up to 400 keys · ~3,242 cycles per query row (analytic).',
      'blocks': [('P1', '1 · Program shapes', 'rows, keys, dimensions'), ('P2', '2 · Multiply QKᵀ', 'shared array, 16 lanes'), ('P3', '3 · Weight', 'row max → softmax EXP table'), ('P4', '4 · Combine', 'weighted sum ÷ one reciprocal'),
                 ('P5', '5 · Requantise', 'saturate to INT8'), ('P6', '6 · Write back', 'INT8 output to memory'), ('K', 'K buffer', 'SRAM macro · loaded once per kick'), ('V', 'V buffer', 'SRAM macro · re-read per row'), ('EXP', 'EXP table', '256 × 15-bit weights', 2)]},
   ]},
  ]},

 {'id': 'd100', 'code': 'D100',
  'frame': 'D100  ·  28 nm SoC  ·  failsafe island buildable at 130 nm',
  'input': 'Cameras · IMU, magnetometer, barometer · RC receiver and telemetry radio  (external)',
  'output': 'ESCs and motors  (external)',
  'marks': {'IMU': ['①'], 'MIPI': ['②'], 'POSE': ['③'], 'ESC': ['④'], 'LM': ['⑤'], 'IND': ['F']},
  'edges': [('IN', 'IMU', '', 'inertial sensors'), ('IMU', 'CPU', '①', 'attitude, 8 kHz'), ('RC', 'CPU', '', 'pilot and telemetry'), ('IN', 'MIPI', '②', 'camera frames'), ('MIPI', 'ISP', '', 'raw frames'), ('ISP', 'FEAT', '', 'rectified frames'), ('FEAT', 'POSE', '', '2k features per frame'), ('POSE', 'CPU', '③', '30 Hz pose over the crossbar'), ('CPU', 'ESC', '', 'motor commands'), ('ESC', 'OUT', '④', 'DShot600'),
            ('NPU', 'YOLO', '', 'detections'), ('NPU', 'SEG', '', 'segmentation'), ('LM', 'FSM', '⑤', 'link or sensor loss'), ('FSM', 'IND', '', 'return-to-home / land'), ('IND', 'OUT', 'F', 'direct ESC control')],
  'rows': [
   {'zones': [
     {'key': 'FC', 'name': 'Flight control · hard real-time', 'cols': 2, 'w': 1,
      'blocks': [('CPU', 'DGridRiscV × 2', 'RV32IM_Zicsr · FC core + NAV core · PX4 / ArduPilot loop', 2), ('IMU', 'IMU / MAG / BARO', 'SPI × 3 · 8 kHz'), ('ESC', 'ESC OUT', 'DShot600 · 8 channels'), ('RC', 'RC + telemetry', 'SBUS · CRSF · MAVLink over UART', 2)]},
     {'key': 'VIO', 'name': 'Visual-inertial odometry', 'cols': 3, 'w': 1.1,
      'blocks': [('MIPI', 'MIPI CSI-2', '2 lanes · up to 1080p60'), ('ISP', 'ISP', 'rectify + LSC'), ('FEAT', 'Feature', 'FAST + BRIEF · 2k points per frame'), ('POSE', 'Pose engine', 'EKF · IMU pre-integration · sliding-window BA · 30 Hz pose, 6-DoF', 3)]},
     {'key': 'AI', 'name': 'AI · phase 2 · on the 28 nm chip', 'tone': 'optional', 'cols': 1, 'w': 0.8,
      'blocks': [('NPU', 'NPU', 'INT8 / INT4 · ~10 TOPS class · MAC array · SRAM 2 MB · DMA'), ('YOLO', 'YOLO-family', 'object detection'), ('SEG', 'SEG', 'obstacle avoidance')]},
   ]},
   {'bus': 'AXI4 crossbar  ·  128-bit  ·  200 MHz'},
   {'zones': [
     {'key': 'FS', 'name': 'Failsafe island · isolated power and clock', 'tone': 'safe', 'cols': 2, 'w': 1,
      'note': 'The failsafe path is independent of the mission stack.',
      'blocks': [('LM', 'Link monitor', 'RC loss · GPS loss · IMU fault · hardware, not firmware'), ('IND', 'Independent path', 'direct to the ESCs · bypasses FC, VIO and AI'), ('FSM', 'Safe-state FSM', 'return-to-home / land', 2)]},
     {'key': 'PL', 'name': 'Platform', 'cols': 4, 'w': 1.6,
      'blocks': [('DDR', 'LPDDR4', '2 GB · 32-bit'), ('EMMC', 'eMMC / NAND', 'logging'), ('PMU', 'PMU', '5 domains'), ('SEC', 'SEC', 'secure boot'), ('ETH', 'ETH / USB3', 'payload + ground link', 2), ('CAN', 'CAN-FD × 2 · SPI · I²C', 'gimbal, payload'), ('JTAG', 'JTAG', 'debug')]},
   ]},
  ],
  'strip': ('Artix-7 FPGA · 81.25 MHz · validation only', '28 nm SoC · failsafe island buildable at 130 nm')},
]
