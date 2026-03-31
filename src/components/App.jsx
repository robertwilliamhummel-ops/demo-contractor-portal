import AdminDashboard from './components/AdminDashboard';

const demoUser = {
  uid: 'demo',
  email: 'demo@techflowsolutions.ca'
};

function App() {
  return <AdminDashboard user={demoUser} />;
}

export default App;
