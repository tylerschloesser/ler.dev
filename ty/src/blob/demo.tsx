import React, { useState } from 'react'
import styled from 'styled-components'
import { Blob } from './blob'
import { Config } from './config'

const Controls = styled.div`
  position: fixed;
  display: flex;
`

const Label = styled.label`
  display: flex;
  align-items: center;
`

export function Demo() {
  const [config, setConfig] = useState<Config>({
    parts: 600,
    xScale: 1,
    yScale: 1,
    zScale: 0.0005,
  })

  const sliders = [
    {
      name: 'parts',
      min: 3,
      max: 1000,
      step: 1,
      value: config.parts,
      toConfig: (value: number) => ({ parts: value }),
    },
    {
      name: 'xy scale',
      min: 0.1,
      max: 10,
      step: 0.05,
      value: config.xScale,
      toConfig: (value: number) => ({ xScale: value, yScale: value }),
    },
    {
      name: 'z scale',
      min: 0,
      max: 0.002,
      step: 0.00005,
      value: config.zScale,
      toConfig: (value: number) => ({ zScale: value }),
    },
  ]
  console.log(sliders)

  return (
    <>
      <Controls>
        {sliders.map(({ name, min, max, step, value, toConfig }) => (
          <Label key={name}>
            {name}
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  ...toConfig(parseFloat(e.target.value)),
                }))
              }
            />
          </Label>
        ))}
      </Controls>
      <Blob config={config} />
    </>
  )
}
