const EnforceSwitch = ({ enforce, onChange }: { enforce: boolean, onChange: React.ChangeEventHandler<HTMLInputElement> }) => {
  return (
    <label className="switch switch-sm justify-center">
      <input type="checkbox" checked={enforce} value="1" onChange={onChange} />
    </label>
  );
};

export { EnforceSwitch };
