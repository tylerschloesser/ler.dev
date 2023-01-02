import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Blob } from './blob'
import { Config, RenderMethod } from './config'

const Controls = styled.div`
  position: fixed;
  display: flex;
  flex-direction: column;
`

const Label = styled.label`
  display: flex;
  align-items: center;
`

const storage = {
  getOrDefault() {
    const config: Partial<Config> = JSON.parse(
      localStorage.getItem('config') || '{}',
    )
    const defaultConfig: Config = {
      parts: 600,
      xScale: 1,
      yScale: 1,
      zScale: 0.0005,
      renderMethod: RenderMethod.Simple,
    }
    return {
      ...defaultConfig,
      ...config,
    }
  },
  put(config: Config) {
    localStorage.setItem('config', JSON.stringify(config, null, 2))
  },
}

export function Demo() {
  const [config, setConfig] = useState<Config>(storage.getOrDefault())
  useEffect(() => storage.put(config), [config])

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
        <fieldset>
          <legend>render method</legend>
          {Object.values(RenderMethod).map((renderMethod) => (
            <label key={renderMethod}>
              {renderMethod}
              <input
                type="radio"
                value={renderMethod}
                checked={config.renderMethod === renderMethod}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    renderMethod: e.target.value as RenderMethod,
                  }))
                }
              />
            </label>
          ))}
        </fieldset>
      </Controls>
      <Blob config={config} />
    </>
  )
}
