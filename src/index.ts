#!/usr/bin/env bun
import * as p from '@clack/prompts';
import pc from 'picocolors';

async function main() {
  p.intro(pc.bgCyan(pc.black(' Ultimate Image Prompt Generator ')));

  p.outro('Ready to build prompts!');
}

main().catch(console.error);
