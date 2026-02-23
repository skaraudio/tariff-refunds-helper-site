import {useCallback, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {AlertCircle, FileText, Loader2, Upload, X,} from 'lucide-react';
import {cn} from '@/lib/utils';
import RefundResults from '@/components/RefundResults';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const STATES = {
   IDLE: 'idle',
   UPLOADING: 'uploading',
   PROCESSING: 'processing',
   SUCCESS: 'success',
   ERROR: 'error',
};

export default function FileUpload() {
   const [state, setState] = useState(STATES.IDLE);
   const [dragActive, setDragActive] = useState(false);
   const [fileName, setFileName] = useState('');
   const [progress, setProgress] = useState(0);
   const [error, setError] = useState('');
   const [results, setResults] = useState(null);
   const inputRef = useRef(null);

   const reset = useCallback(() => {
      setState(STATES.IDLE);
      setDragActive(false);
      setFileName('');
      setProgress(0);
      setError('');
      setResults(null);
      if (inputRef.current) inputRef.current.value = '';
   }, []);

   const uploadFile = useCallback(async (file) => {
      if (!file) return;

      if (!file.name.toLowerCase().endsWith('.pdf')) {
         setState(STATES.ERROR);
         setError('Only PDF files are accepted.');
         return;
      }

      if (file.size > MAX_SIZE) {
         setState(STATES.ERROR);
         setError('File exceeds the 10 MB size limit.');
         return;
      }

      setFileName(file.name);
      setState(STATES.UPLOADING);
      setProgress(0);
      setError('');

      try {
         const formData = new FormData();
         formData.append('file', file);

         // Simulate progress for UX since fetch doesn't expose upload progress natively
         const progressInterval = setInterval(() => {
            setProgress((prev) => {
               if (prev >= 90) {
                  clearInterval(progressInterval);
                  return 90;
               }
               return prev + Math.random() * 15;
            });
         }, 200);

         const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
         });

         clearInterval(progressInterval);
         setProgress(100);

         if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || 'Upload failed. Please try again.');
         }

         setState(STATES.PROCESSING);

         const data = await res.json();
          setResults(data.result);
         setState(STATES.SUCCESS);
      } catch (err) {
         setState(STATES.ERROR);
         setError(err.message || 'Something went wrong. Please try again.');
      }
   }, []);

   const handleDrag = useCallback((e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') {
         setDragActive(true);
      } else if (e.type === 'dragleave') {
         setDragActive(false);
      }
   }, []);

   const handleDrop = useCallback(
      (e) => {
         e.preventDefault();
         e.stopPropagation();
         setDragActive(false);
         const file = e.dataTransfer?.files?.[0];
         uploadFile(file);
      },
      [uploadFile]
   );

   const handleChange = useCallback(
      (e) => {
         const file = e.target.files?.[0];
         uploadFile(file);
      },
      [uploadFile]
   );

   return (
      <section id="upload" className="bg-background py-20">
         <div className="mx-auto max-w-2xl px-6">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5 }}
               className="text-center"
            >
               <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                  Check Your Entry Summary
               </h2>
               <p className="mt-3 text-muted-foreground">
                  Upload your CBP 7501 entry summary PDF and we will scan it
                  for refund-eligible IEEPA tariff codes.
               </p>
            </motion.div>

            <AnimatePresence mode="wait">
               {state === STATES.SUCCESS && results ? (
                  <motion.div
                     key="results"
                     initial={{ opacity: 0, y: 12 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -12 }}
                     transition={{ duration: 0.3 }}
                     className="mt-10"
                  >
                     <RefundResults results={results} />
                     <div className="mt-6 text-center">
                        <button
                           onClick={reset}
                           className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                        >
                           Upload Another
                        </button>
                     </div>
                  </motion.div>
               ) : (
                  <motion.div
                     key="uploader"
                     initial={{ opacity: 0, y: 12 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -12 }}
                     transition={{ duration: 0.3 }}
                     className="mt-10"
                  >
                     {/* Drop zone */}
                     <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={() =>
                           state === STATES.IDLE && inputRef.current?.click()
                        }
                        className={cn(
                           'relative cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors',
                           dragActive
                              ? 'border-foreground bg-muted'
                              : 'border-border hover:border-foreground/30 hover:bg-muted/50',
                           state !== STATES.IDLE &&
                              state !== STATES.ERROR &&
                              'pointer-events-none'
                        )}
                     >
                        <input
                           ref={inputRef}
                           type="file"
                           accept=".pdf"
                           onChange={handleChange}
                           className="hidden"
                        />

                        {/* Idle */}
                        {state === STATES.IDLE && (
                           <>
                              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                              <p className="mt-4 text-base font-semibold text-foreground">
                                 Drop your PDF here or click to browse
                              </p>
                              <p className="mt-1.5 text-sm text-muted-foreground">
                                 CBP 7501 Entry Summary — PDF only, 10 MB max
                              </p>
                           </>
                        )}

                        {/* Uploading */}
                        {state === STATES.UPLOADING && (
                           <>
                              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                              <p className="mt-4 text-base font-semibold text-foreground">
                                 Uploading {fileName}...
                              </p>
                              <div className="mx-auto mt-4 h-1.5 max-w-xs overflow-hidden rounded-full bg-muted">
                                 <motion.div
                                    className="h-full rounded-full bg-foreground"
                                    initial={{ width: '0%' }}
                                    animate={{
                                       width: `${Math.min(progress, 100)}%`,
                                    }}
                                    transition={{ duration: 0.3 }}
                                 />
                              </div>
                              <p className="mt-2 text-sm tabular-nums text-muted-foreground">
                                 {Math.round(Math.min(progress, 100))}%
                              </p>
                           </>
                        )}

                        {/* Processing */}
                        {state === STATES.PROCESSING && (
                           <>
                              <Loader2 className="mx-auto h-12 w-12 animate-spin text-muted-foreground" />
                              <p className="mt-4 text-base font-semibold text-foreground">
                                 Scanning for IEEPA tariff codes...
                              </p>
                              <p className="mt-1.5 text-sm text-muted-foreground">
                                 Analyzing {fileName}
                              </p>
                           </>
                        )}

                        {/* Error */}
                        {state === STATES.ERROR && (
                           <>
                              <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
                              <p className="mt-4 text-base font-semibold text-foreground">
                                 {error}
                              </p>
                              <button
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    reset();
                                 }}
                                 className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground underline underline-offset-4"
                              >
                                 <X className="h-4 w-4" />
                                 Try again
                              </button>
                           </>
                        )}
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </section>
   );
}
