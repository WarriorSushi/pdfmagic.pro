"use client"

import * as React from "react"

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}

interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
}

interface SelectContentProps {
  children: React.ReactNode
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
}

const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  return (
    <div className="relative">
      {React.Children.map(children, child => 
        React.isValidElement(child) 
          ? React.cloneElement(child as React.ReactElement<any>, { value, onValueChange })
          : child
      )}
    </div>
  )
}

const SelectTrigger: React.FC<SelectTriggerProps & { value?: string; onValueChange?: (value: string) => void }> = ({ 
  children, 
  className = "",
  value,
  onValueChange 
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  
  return (
    <div className="relative">
      <button
        className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value || "Select..."}</span>
        <span>▼</span>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-gray-300 bg-white shadow-lg">
          {React.Children.map(children, child => 
            React.isValidElement(child) && child.type === SelectContent
              ? React.cloneElement(child as React.ReactElement<any>, { 
                  onValueChange: (newValue: string) => {
                    onValueChange?.(newValue)
                    setIsOpen(false)
                  }
                })
              : null
          )}
        </div>
      )}
    </div>
  )
}

const SelectContent: React.FC<SelectContentProps & { onValueChange?: (value: string) => void }> = ({ 
  children, 
  onValueChange 
}) => {
  return (
    <div className="p-1">
      {React.Children.map(children, child => 
        React.isValidElement(child) 
          ? React.cloneElement(child as React.ReactElement<any>, { onValueChange })
          : child
      )}
    </div>
  )
}

const SelectItem: React.FC<SelectItemProps & { onValueChange?: (value: string) => void }> = ({ 
  value, 
  children, 
  onValueChange 
}) => {
  return (
    <div
      className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm hover:bg-gray-100"
      onClick={() => onValueChange?.(value)}
    >
      {children}
    </div>
  )
}

const SelectValue: React.FC<{}> = () => null

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
}
