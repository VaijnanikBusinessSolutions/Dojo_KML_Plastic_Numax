// Updated AddNewItemsSection.tsx
import { Plus } from 'lucide-react';
import SelectionCard from '../../molecules/SelectionCard/SelectionCard';
import AddInput from '../../molecules/Addinput/AddInput';
import type { NewItems, Hq, Factory } from '../../pages/Planning/types';

interface AddNewItemsSectionProps {
  newItems: NewItems;
  onItemChange: (key: keyof NewItems, value: string) => void;
  onAddItem: (type: keyof NewItems) => Promise<void>;
  hqs?: Hq[];
  factories?: Factory[];
  onHQSelect?: (hqName: string) => void;
  onFactorySelect?: (factoryName: string) => void;
}

const AddNewItemsSection = ({ 
  newItems, 
  onItemChange, 
  onAddItem,
  hqs = [],
  factories = [],
  onHQSelect = () => {},
  onFactorySelect = () => {}
}: AddNewItemsSectionProps) => {
  const items = [
    { 
      key: 'hq' as const, 
      label: 'HQ', 
      placeholder: 'HQ name',
      options: hqs.map(hq => hq.name),
      onSelect: onHQSelect
    },
    { 
      key: 'factory' as const, 
      label: 'Factory', 
      placeholder: 'Factory name',
      options: factories.map(f => f.name),
      onSelect: onFactorySelect
    },
    { 
      key: 'shopFloor' as const, 
      label: 'Shop Floor', 
      placeholder: 'Shop floor name' 
    },
    { 
      key: 'line' as const, 
      label: 'Production Line', 
      placeholder: 'Line name' 
    },
    { 
      key: 'subline' as const, 
      label: 'Sub Line', 
      placeholder: 'Sub line name' 
    },
    { 
      key: 'station' as const, 
      label: 'Station', 
      placeholder: 'Station name' 
    }
  ];

  return (
    <SelectionCard title="Add New Items" icon={Plus}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <AddInput
            key={item.key}
            label={item.label}
            placeholder={item.placeholder}
            value={newItems[item.key]}
            onChange={(value) => onItemChange(item.key, value)}
            onAdd={() => onAddItem(item.key)}
            options={item.options}
            onSelect={item.onSelect}
          />
        ))}
      </div>
    </SelectionCard>
  );
};

export default AddNewItemsSection;