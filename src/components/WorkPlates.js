// DISABLED: This file contains JSX syntax that crashes Node.js
// TODO: Convert JSX to React.createElement or compile with Babel
console.log('⚠️  JSX component disabled - needs conversion');
export default function DisabledComponent() {
  return null;
}

/* ORIGINAL CODE (commented out to prevent crashes):
import React from 'react';
import { Box, Text, useInput, useApp, Spacer } from 'ink';
import { Select, MultiSelect } from '@inkjs/ui';

const WorkPlates = ({ projectPath, onExit }) => {
  const { exit } = useApp();
  const [selectedPlate, setSelectedPlate] = React.useState(null);
  const [plates, setPlates] = React.useState([]);
  const [mode, setMode] = React.useState('overview'); // overview, plate, creating
  const [newPlateData, setNewPlateData] = React.useState({ name: '', description: '' });

  // Load existing work plates from project
  React.useEffect(() => {
    loadWorkPlates();
  }, []);

  const loadWorkPlates = async () => {
    try {
      // Load plates from project configuration
      const samplePlates = [
        {
          id: 'main',
          name: 'Main Project',
          description: 'Core project files and documentation',
          files: ['README.md', 'package.json', 'cli.js'],
          status: 'active',
          created: new Date().toISOString(),
          lastModified: new Date().toISOString()
        },
        {
          id: 'assets',
          name: 'Assets & Media',
          description: 'Images, videos, and other media files',
          files: [],
          status: 'empty',
          created: new Date().toISOString(),
          lastModified: new Date().toISOString()
        }
      ];
      setPlates(samplePlates);
    } catch (error) {
      console.error('Error loading work plates:', error);
    }
  };

  const createNewPlate = () => {
    const newPlate = {
      id: Date.now().toString(),
      name: newPlateData.name || 'Untitled Plate',
      description: newPlateData.description || 'New work plate',
      files: [],
      status: 'empty',
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    setPlates([...plates, newPlate]);
    setNewPlateData({ name: '', description: '' });
    setMode('overview');
  };

  const selectPlate = (plate) => {
    setSelectedPlate(plate);
    setMode('plate');
  };

  const backToOverview = () => {
    setSelectedPlate(null);
    setMode('overview');
  };

  useInput((input, key) => {
    if (key.escape) {
      if (mode === 'plate') {
        backToOverview();
      } else {
        onExit();
      }
    }
    
    if (input === 'q' && mode === 'overview') {
      onExit();
    }
    
    if (input === 'n' && mode === 'overview') {
      setMode('creating');
    }
    
    if (input === 'p' && mode === 'overview') {
      // Generate post card
      generatePostCard();
    }
  });

  const generatePostCard = () => {
    console.log('📬 Generating post card...');
    // This would trigger the post card generation process
  };

  if (mode === 'creating') {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="cyan">
          📋 Create New Work Plate
        </Text>
        <Text> </Text>
        <Box flexDirection="column" gap={1}>
          <Text>
            <Text color="yellow">Name:</Text> {newPlateData.name || 'Untitled Plate'}
          </Text>
          <Text>
            <Text color="yellow">Description:</Text> {newPlateData.description || 'New work plate'}
          </Text>
          <Text> </Text>
          <Text dimColor>
            Press <Text color="green">Enter</Text> to create, <Text color="red">Escape</Text> to cancel
          </Text>
        </Box>
        <useInput={(input, key) => {
          if (key.return) {
            createNewPlate();
          }
        }} />
      </Box>
    );
  }

  if (mode === 'plate' && selectedPlate) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="cyan">
          📋 {selectedPlate.name}
        </Text>
        <Text color="gray">
          {selectedPlate.description}
        </Text>
        <Text> </Text>
        
        <Box flexDirection="column">
          <Text color="yellow">Files ({selectedPlate.files.length}):</Text>
          {selectedPlate.files.length > 0 ? (
            selectedPlate.files.map((file, index) => (
              <Text key={index} color="green">
                  📄 {file}
              </Text>
            ))
          ) : (
            <Text color="gray" dimColor>
              No files in this plate
            </Text>
          )}
        </Box>
        
        <Text> </Text>
        <Box flexDirection="row" gap={2}>
          <Text color="gray">
            Status: <Text color={selectedPlate.status === 'active' ? 'green' : 'yellow'}>
              {selectedPlate.status}
            </Text>
          </Text>
          <Text color="gray">
            Created: {new Date(selectedPlate.created).toLocaleDateString()}
          </Text>
        </Box>
        
        <Text> </Text>
        <Text dimColor>
          Press <Text color="red">Escape</Text> to go back, <Text color="green">a</Text> to add files
        </Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">
        🎨 Work Plates Canvas
      </Text>
      <Text color="gray">
        Interactive workspace for managing your project files
      </Text>
      <Text> </Text>
      
      <Box flexDirection="column" gap={1}>
        {plates.map((plate, index) => (
          <Box
            key={plate.id}
            flexDirection="row"
            padding={1}
            borderStyle="round"
            borderColor={selectedPlate?.id === plate.id ? 'cyan' : 'gray'}
          >
            <Box flexDirection="column" flexGrow={1}>
              <Text bold color="white">
                📋 {plate.name}
              </Text>
              <Text color="gray" dimColor>
                {plate.description}
              </Text>
              <Text color="yellow">
                {plate.files.length} files • {plate.status}
              </Text>
            </Box>
            
            <Box alignSelf="flex-end">
              <Text color="green">
                Press {index + 1} to select
              </Text>
            </Box>
          </Box>
        ))}
      </Box>
      
      <Text> </Text>
      <Spacer />
      
      <Box flexDirection="row" gap={4}>
        <Text color="gray">
          <Text color="green">n</Text> new plate
        </Text>
        <Text color="gray">
          <Text color="green">p</Text> generate post card
        </Text>
        <Text color="gray">
          <Text color="green">q</Text> quit
        </Text>
      </Box>
      
      <useInput={(input, key) => {
        const num = parseInt(input);
        if (num >= 1 && num <= plates.length) {
          selectPlate(plates[num - 1]);
        }
      }} />
    </Box>
  );
};

export default WorkPlates;
*/