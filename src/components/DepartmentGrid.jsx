const departments = [
  'Safety and Miscellaneous',
  'Propulsion',
  'Airframe and Structures',
  'Electrical and Electronics'
]

const DepartmentGrid = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
      {departments.map((dept) => (
        <button
          key={dept}
          onClick={() => onSelect(dept)}
          className="group relative h-40 flex flex-col items-center justify-center border-2 border-black hover:bg-black hover:text-white transition-all duration-300 overflow-hidden"
        >
          <span className="text-xs tracking-tighter opacity-40 uppercase mb-2 group-hover:text-white/60">
            DEPARTMENT
          </span>
          <span className="text-lg font-bold tracking-widest text-center px-4 uppercase">
            {dept}
          </span>
          
          {/* Subtle accent lines */}
          <div className="absolute bottom-4 right-4 w-8 h-[2px] bg-current opacity-20 group-hover:opacity-100 transition-opacity" />
        </button>
      ))}
    </div>
  )
}

export default DepartmentGrid
