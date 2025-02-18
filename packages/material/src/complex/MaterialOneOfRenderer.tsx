/*
  The MIT License
  
  Copyright (c) 2017-2019 EclipseSource Munich
  https://github.com/eclipsesource/jsonforms
  
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/
import React, { useCallback, useState } from 'react';

import {
  createCombinatorRenderInfos,
  createDefaultValue,
  isOneOfControl,
  JsonSchema,
  OwnPropsOfControl,
  RankedTester,
  rankWith,
  resolveSubSchemas,
  DispatchPropsOfControl,
  StatePropsOfCombinator,
} from '@jsonforms/core';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Hidden,
  Tab,
  Tabs
} from '@material-ui/core';
import {
  JsonFormsDispatch,
  withJsonFormsOneOfProps
} from '@jsonforms/react';
import CombinatorProperties from './CombinatorProperties';

export interface OwnOneOfProps extends OwnPropsOfControl {
  indexOfFittingSchema?: number;
}

const oneOf = 'oneOf';
const MaterialOneOfRenderer =
  ({ handleChange, schema, path, renderers, rootSchema, id, visible, indexOfFittingSchema }: StatePropsOfCombinator & DispatchPropsOfControl) => {
    const [open, setOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(indexOfFittingSchema || 0);
    const [newSelectedIndex, setNewSelectedIndex] = useState(0);
    const handleClose = useCallback(() => setOpen(false), [setOpen]);
    const cancel = useCallback(() => {
      setOpen(false);
    }, [setOpen]);
    const handleTabChange = useCallback((_event: any, newOneOfIndex: number) => {
      setOpen(true);
      setNewSelectedIndex(newOneOfIndex);
    }, [setOpen, setSelectedIndex]);
    //const { handleChange } = ctxDispatchToControlProps(dispatch);
    const _schema = resolveSubSchemas(schema, rootSchema, oneOf);
    const oneOfRenderInfos = createCombinatorRenderInfos((_schema as JsonSchema).oneOf, rootSchema, oneOf);
    const confirm = useCallback(() => {
      handleChange(
        path,
        createDefaultValue(schema.oneOf[newSelectedIndex])
      );
      setOpen(false);
      setSelectedIndex(newSelectedIndex);
    }, [handleChange, createDefaultValue, newSelectedIndex]);

    return (
      <Hidden xsUp={!visible}>
        <CombinatorProperties
          schema={_schema}
          combinatorKeyword={'oneOf'}
          path={path}
        />
        <Tabs value={selectedIndex} onChange={handleTabChange}>
          {oneOfRenderInfos.map(oneOfRenderInfo => <Tab key={oneOfRenderInfo.label} label={oneOfRenderInfo.label} />)}
        </Tabs>
        {
          oneOfRenderInfos.map((oneOfRenderInfo, oneOfIndex) => (
            selectedIndex === oneOfIndex && (
              <JsonFormsDispatch
                key={oneOfIndex}
                schema={oneOfRenderInfo.schema}
                uischema={oneOfRenderInfo.uischema}
                path={path}
                renderers={renderers}
              />
            )
          ))
        }
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby='alert-dialog-title'
          aria-describedby='alert-dialog-description'
        >
          <DialogTitle id='alert-dialog-title'>{'Clear form?'}</DialogTitle>
          <DialogContent>
            <DialogContentText id='alert-dialog-description'>
              Your data will be cleared if you navigate away from this tab.
              Do you want to proceed?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancel} color='primary'>
              No
            </Button>
            <Button onClick={confirm} color='primary' autoFocus id={`oneOf-${id}-confirm-yes`}>
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </Hidden>
    );
  };

export const materialOneOfControlTester: RankedTester = rankWith(3, isOneOfControl);
export default withJsonFormsOneOfProps(MaterialOneOfRenderer);
