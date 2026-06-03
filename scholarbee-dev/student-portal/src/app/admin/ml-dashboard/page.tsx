
'use client';

import React, { useEffect, useState } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SyncIcon from '@mui/icons-material/Sync';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Cookies from 'js-cookie';

import {
  Box, Typography, Card, CardContent, Grid, Button, Chip,
  Switch, Slider, CircularProgress, Alert, LinearProgress,
  Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper,
  Avatar, Divider, FormControlLabel, TextField
} from '@mui/material';

export default function MLDashboard() {
  const [status, setStatus] = useState<any>(null);
  const [shadowStats, setShadowStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState('');
  
  // Local config states for Section E
  const [config, setConfig] = useState({ ml_enabled: false, shadow_mode: false, rollout_pct: 0 });

  // Test Model state
  const [testModelResult, setTestModelResult] = useState<any>(null);
  const [testingModel, setTestingModel] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('http://localhost:3010/api/admin/ml/status', {
        headers: {
          'Authorization': `Bearer ${Cookies.get('access_token')}`
        }
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch status: ${res.status} ${text}`);
      }
      const data = await res.json();
      setStatus(data);
      setConfig(data.config);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchShadowStats = async () => {
    try {
      const res = await fetch('http://localhost:3010/api/admin/ml/shadow-stats', {
        headers: { 'Authorization': `Bearer ${Cookies.get('access_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setShadowStats(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchShadowStats();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTrain = async (force: boolean) => {
    if (force && !confirm('This will retrain on all available data. Continue?')) return;
    try {
      await fetch('http://localhost:3010/api/admin/ml/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('access_token')}`
        },
        body: JSON.stringify({ force })
      });
      alert('Training triggered!');
      fetchStatus();
    } catch (err) {
      alert('Failed to trigger training.');
    }
  };

  const handleSaveConfig = async () => {
    try {
      const res = await fetch('http://localhost:3010/api/admin/ml/config', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('access_token')}`
        },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        alert('Configuration saved successfully');
        fetchStatus();
      } else {
        alert('Failed to save configuration');
      }
    } catch (err) {
      alert('Error saving configuration');
    }
  };

  const handleTestModel = async () => {
    setTestingModel(true);
    setTestModelResult(null);
    try {
      const url = testEmail.trim() 
        ? `http://localhost:3010/api/admin/ml/test?email=${encodeURIComponent(testEmail.trim())}` 
        : 'http://localhost:3010/api/admin/ml/test';
        
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${Cookies.get('access_token')}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to test model');
      setTestModelResult(data);
    } catch (err: any) {
      alert(`Test Model Failed: ${err.message}`);
    } finally {
      setTestingModel(false);
    }
  };

  if (loading) return (
    <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box sx={{ p: 4 }}>
      <Alert severity="error">{error}</Alert>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <DashboardIcon sx={{ color: '#1976d2', fontSize: 40 }} />
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          ML Control Center
        </Typography>
      </Box>

      {/* Section A - System Status Bar */}
      <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 1 }}>
        <CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip 
            icon={status?.service?.ml_service_reachable ? <CheckCircleIcon /> : <ErrorIcon />} 
            label={`ML Service: ${status?.service?.ml_service_reachable ? 'Online' : 'Unreachable'}`}
            color={status?.service?.ml_service_reachable ? 'success' : 'error'}
            variant="outlined"
          />
          <Chip 
            icon={status?.model?.loaded ? <CheckCircleIcon /> : status?.service?.is_training ? <SyncIcon sx={{ animation: 'spin 2s linear infinite' }} /> : <ErrorIcon />} 
            label={`Model: ${status?.model?.loaded ? `Loaded (v${status.model.version})` : status?.service?.is_training ? 'Training...' : 'Not Trained'}`}
            color={status?.model?.loaded ? 'success' : status?.service?.is_training ? 'warning' : 'default'}
            variant="outlined"
          />
          <Chip 
            label={`Mode: ${!status?.config?.ml_enabled ? 'Disabled' : status?.config?.shadow_mode ? 'Shadow Mode' : `Live (${status?.config?.rollout_pct}%)`}`}
            color={!status?.config?.ml_enabled ? 'default' : status?.config?.shadow_mode ? 'warning' : 'success'}
            variant="outlined"
          />
        </CardContent>
      </Card>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        
        {/* Section B - Data Readiness */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 1 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}>
                Training Data
              </Typography>
              
              <Box sx={{ mt: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontWeight="bold">Labeled Impressions</Typography>
                  <Typography variant="body2">{status?.data?.labeled_impressions} / 500</Typography>
                </Box>
                <LinearProgress variant="determinate" value={Math.min((status?.data?.labeled_impressions / 500) * 100, 100)} sx={{ height: 8, borderRadius: 4 }} />
              </Box>

              <Box sx={{ mt: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontWeight="bold">Unique Students</Typography>
                  <Typography variant="body2">{status?.data?.unique_students} / 20</Typography>
                </Box>
                <LinearProgress variant="determinate" value={Math.min((status?.data?.unique_students / 20) * 100, 100)} sx={{ height: 8, borderRadius: 4 }} />
              </Box>

              <Box sx={{ p: 2, bgcolor: '#f3f4f6', borderRadius: 2, mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" fontWeight="bold">Positive Rate:</Typography>
                <Typography variant="body2" fontWeight="bold" color={status?.data?.positive_rate >= 0.03 && status?.data?.positive_rate <= 0.60 ? 'success.main' : 'error.main'}>
                  {(status?.data?.positive_rate * 100).toFixed(1)}%
                </Typography>
              </Box>

              <Box sx={{ p: 2, bgcolor: '#f3f4f6', borderRadius: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" fontWeight="bold">ML Ready:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {status?.data?.ml_ready ? '✅ Yes' : '⏳ Not yet'}
                </Typography>
              </Box>

              {!status?.data?.ml_ready && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Run the warm-up script to bootstrap training data:
                  <Box sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.5)', p: 1, borderRadius: 1, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    npx ts-node src/recommendations/scripts/generate-warmup-impressions.ts
                  </Box>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Section C - Model Status */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 1 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}>
                Model Status
              </Typography>
              
              {!status?.model?.loaded ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 2 }}>
                  <Typography color="text.secondary">No model trained yet</Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    disabled={status?.service?.is_training}
                    onClick={() => handleTrain(true)}
                  >
                    {status?.service?.is_training ? 'Training in progress...' : 'Train Model Now'}
                  </Button>
                </Box>
              ) : (
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ p: 2, bgcolor: '#f3f4f6', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">VERSION</Typography>
                        <Typography variant="body1" fontWeight="bold" noWrap title={status.model.version}>{status.model.version}</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ p: 2, bgcolor: '#f3f4f6', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">MODE</Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip size="small" label={status.model.bootstrap_mode ? 'Bootstrap' : 'Production'} color={status.model.bootstrap_mode ? 'warning' : 'success'} />
                        </Box>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ p: 2, bgcolor: '#f3f4f6', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">TRAINING SAMPLES</Typography>
                        <Typography variant="body1" fontWeight="bold">{status.model.n_training_samples}</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ p: 2, bgcolor: '#f3f4f6', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">AUC-ROC</Typography>
                        <Typography variant="body1" fontWeight="bold" color={status.model.auc_roc >= 0.65 ? 'success.main' : status.model.auc_roc >= 0.50 ? 'warning.main' : 'error.main'}>
                          {status.model.auc_roc?.toFixed(3)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Button 
                    variant="outlined" 
                    fullWidth 
                    sx={{ mt: 3 }}
                    disabled={status?.service?.is_training}
                    onClick={() => handleTrain(true)}
                  >
                    Retrain Model (Force)
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      {/* Section D - Shadow Mode Analytics */}
      {shadowStats && shadowStats.total_comparisons >= 10 && (
        <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 1 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}>
              ML vs Rules Engine Comparison
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 4, mb: 4, p: 3, bgcolor: '#f3f4f6', borderRadius: 2, alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight="bold">Total Comparisons</Typography>
                <Typography variant="h4" fontWeight="bold">{shadowStats.total_comparisons}</Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight="bold">Avg Rank Correlation</Typography>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {shadowStats.avg_rank_correlation?.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {shadowStats.avg_rank_correlation > 0.85 
                    ? "Models largely agree — ML is learning similar patterns" 
                    : shadowStats.avg_rank_correlation > 0.65 
                      ? "Some divergence — ML has found different signals"
                      : "Significant divergence — review shadow comparisons"}
                </Typography>
              </Box>
            </Box>

            <TableContainer component={Paper} elevation={0} variant="outlined">
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f9fafb' }}>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Correlation</TableCell>
                    <TableCell>Rules Top 3</TableCell>
                    <TableCell>ML Top 3</TableCell>
                    <TableCell>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shadowStats.recent_comparisons?.slice(0, 10).map((comp: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ fontFamily: 'monospace' }}>...{comp.student_id.slice(-4)}</TableCell>
                      <TableCell>{comp.correlation.toFixed(2)}</TableCell>
                      <TableCell>
                        <Box sx={{ fontSize: '0.75rem', maxWidth: 150 }}>
                          {comp.rules_top3.map((id: string) => <div key={id} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{id}</div>)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ fontSize: '0.75rem', maxWidth: 150 }}>
                          {comp.ml_top3.map((id: string) => <div key={id} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{id}</div>)}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                        {new Date(comp.recorded_at).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Section E - Configuration Panel */}
      <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 1 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}>
            ML Configuration
          </Typography>
          
          <Box sx={{ maxWidth: 600, mt: 3, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">ML Enabled</Typography>
                <Typography variant="body2" color="text.secondary">Master switch to turn on ML capabilities</Typography>
              </Box>
              <Switch 
                checked={config.ml_enabled}
                onChange={(e) => setConfig({...config, ml_enabled: e.target.checked})}
                color="primary"
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">Shadow Mode</Typography>
                <Typography variant="body2" color="text.secondary">Log predictions without affecting live users</Typography>
              </Box>
              <Switch 
                checked={config.shadow_mode}
                onChange={(e) => setConfig({...config, shadow_mode: e.target.checked})}
                color="primary"
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">Rollout Percentage</Typography>
                <Typography variant="subtitle1" fontWeight="bold">{config.rollout_pct}%</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Percentage of users receiving live ML recommendations (when Shadow Mode is off)
              </Typography>
              <Slider 
                value={config.rollout_pct}
                step={10}
                marks
                min={0}
                max={100}
                onChange={(_, val) => setConfig({...config, rollout_pct: val as number})}
              />
            </Box>

            {config.ml_enabled && !config.shadow_mode && config.rollout_pct > 0 && (
              <Alert severity="error" icon={<ErrorIcon />}>
                <Typography variant="subtitle2" fontWeight="bold">Live Traffic Warning</Typography>
                <Typography variant="body2">ML model is currently serving live recommendations to {config.rollout_pct}% of users. Adjust with caution.</Typography>
              </Alert>
            )}

            <Divider />
            
            <Box>
              <Button variant="contained" color="primary" onClick={handleSaveConfig} sx={{ px: 4 }}>
                Save Configuration
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Section F - Test Model */}
      <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, borderBottom: 1, borderColor: 'divider', pb: 1 }}>
            <Typography variant="h6" fontWeight="bold">Test ML Model</Typography>
            <Button 
              variant="contained" 
              color="secondary"
              disabled={testingModel || status?.service?.is_training}
              onClick={handleTestModel}
            >
              {testingModel ? 'Running Test...' : 'Run Test Prediction'}
            </Button>
          </Box>

          {!testModelResult && !testingModel && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Click "Run Test Prediction" to pull a random student and 5 random programs, run them through the live ML service, and display the predicted scores.
            </Typography>
          )}

          <Box sx={{ mb: 3 }}>
            <TextField 
              label="Specific User Email (Optional)" 
              variant="outlined" 
              size="small" 
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Leave blank for random user"
              fullWidth
            />
          </Box>

          {testModelResult && testModelResult.status === 'success' && (
            <Box sx={{ mt: 4 }}>
              {/* Student Profile Card */}
              <Card sx={{ bgcolor: '#e3f2fd', mb: 4, elevation: 0, border: '1px solid #90caf9' }}>
                <CardContent>
                  <Typography variant="overline" fontWeight="bold" color="primary.dark">Test Persona (Randomly Selected)</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 1 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                      {testModelResult.student.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">{testModelResult.student.name}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                        <Chip size="small" label={`Major: ${testModelResult.student.intended_major}`} sx={{ bgcolor: 'white' }} />
                        <Chip size="small" label={`Degree: ${testModelResult.student.degree_level}`} sx={{ bgcolor: 'white' }} />
                        <Chip size="small" label={`Destination: ${testModelResult.student.study_destination}`} sx={{ bgcolor: 'white' }} />
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Programs List */}
              <Typography variant="overline" fontWeight="bold" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                ML Ranked Recommendations
              </Typography>
              
              <Grid container spacing={3}>
                {testModelResult.results.map((prog: any, idx: number) => (
                  <Grid size={{ xs: 12, md: 6, lg: 4 }} key={prog.program_id}>
                    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible', '&:hover': { boxShadow: 4 } }}>
                      
                      {/* Rank Badge */}
                      <Box sx={{ 
                        position: 'absolute', top: -12, left: -12, 
                        width: 32, height: 32, bgcolor: 'grey.900', color: 'white', 
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', border: '3px solid white', zIndex: 1 
                      }}>
                        #{idx + 1}
                      </Box>

                      {/* ML Score Badge */}
                      <Chip 
                        label={`${(prog.ml_score * 100).toFixed(1)}% Match`}
                        color="success"
                        sx={{ position: 'absolute', top: -12, right: -12, fontWeight: 'bold', border: '2px solid white', zIndex: 1 }}
                      />

                      <CardContent sx={{ pt: 4 }}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {prog.program_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {prog.university_name}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 3, mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">Rules Score</Typography>
                            <Typography variant="body2" fontWeight="bold">{(prog.rules_score * 100).toFixed(1)}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">Tuition Fee</Typography>
                            <Typography variant="body2" fontWeight="bold">{prog.tuition_fee > 0 ? `$${prog.tuition_fee.toLocaleString()}` : 'N/A'}</Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                          <Chip size="small" label={`Degree Match: ${prog.features.degree_match?.toFixed(2)}`} 
                                color={prog.features.degree_match > 0.5 ? 'success' : 'error'} variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
                          <Chip size="small" label={`Field Sim: ${prog.features.field_similarity?.toFixed(2)}`} 
                                color={prog.features.field_similarity > 0.5 ? 'success' : 'warning'} variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
                          {prog.features.is_partner && (
                            <Chip size="small" label="Partner" color="secondary" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {testModelResult && testModelResult.status === 'error' && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {testModelResult.message}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
