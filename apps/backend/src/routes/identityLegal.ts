import { Router } from 'express';
import {
  getIpAssets,
  getIpAsset,
  createIpAsset,
  updateIpAsset,
  deleteIpAsset,
  getComplianceDocuments,
  getComplianceDocument,
  createComplianceDocument,
  updateComplianceDocument,
  deleteComplianceDocument,
  getInternalPolicies,
  getInternalPolicy,
  createInternalPolicy,
  updateInternalPolicy,
  deleteInternalPolicy,
  getIdentityLegalDocuments,
} from '../controllers/identityLegal.controller';
import { authenticate } from '../middleware/auth';

export const identityLegalRouter = Router({ mergeParams: true });

identityLegalRouter.use(authenticate);

identityLegalRouter.get('/ip-assets', getIpAssets);
identityLegalRouter.post('/ip-assets', createIpAsset);
identityLegalRouter.get('/ip-assets/:id', getIpAsset);
identityLegalRouter.patch('/ip-assets/:id', updateIpAsset);
identityLegalRouter.delete('/ip-assets/:id', deleteIpAsset);

identityLegalRouter.get('/compliance-documents', getComplianceDocuments);
identityLegalRouter.post('/compliance-documents', createComplianceDocument);
identityLegalRouter.get('/compliance-documents/:id', getComplianceDocument);
identityLegalRouter.patch('/compliance-documents/:id', updateComplianceDocument);
identityLegalRouter.delete('/compliance-documents/:id', deleteComplianceDocument);

identityLegalRouter.get('/internal-policies', getInternalPolicies);
identityLegalRouter.post('/internal-policies', createInternalPolicy);
identityLegalRouter.get('/internal-policies/:id', getInternalPolicy);
identityLegalRouter.patch('/internal-policies/:id', updateInternalPolicy);
identityLegalRouter.delete('/internal-policies/:id', deleteInternalPolicy);

identityLegalRouter.get('/documents', getIdentityLegalDocuments);

export default identityLegalRouter;
